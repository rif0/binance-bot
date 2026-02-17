const ccxt = require('ccxt');
const { analyze } = require('./strategy');
const chalk = require('chalk');
const admin = require('firebase-admin');

class TradingBot {
    constructor(config) {
        this.exchange = new ccxt.binance({
            apiKey: config.apiKey,
            secret: config.secret,
            options: { defaultType: 'spot' }
        });

        if (config.useTestnet) {
            this.exchange.setSandboxMode(true);
        }

        this.symbol = 'BTC/USDT';
        this.isTrading = false;
        this.currentPosition = null;

        // Inicializar Firebase Admin si se proporciona la ruta de la llave
        if (config.firebaseServiceAccount) {
            const serviceAccount = require(config.firebaseServiceAccount);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: config.firebaseDatabaseURL
            });
            this.db = admin.database();
            console.log(chalk.green('Firebase Admin inicializado correctamente.'));
        }
    }

    async fetchPrices() {
        try {
            const ohlcv = await this.exchange.fetchOHLCV(this.symbol, '1m', undefined, 100);
            return ohlcv.map(x => x[4]); // Precios de cierre
        } catch (e) {
            console.error(chalk.red('Error al obtener precios:'), e.message);
            return null;
        }
    }

    async reportToFirebase(analysis) {
        if (!this.db) return;

        const { signal, reason, indicators } = analysis;

        // Actualizar estado general
        await this.db.ref('botStatus').set({
            currentPrice: indicators.currentPrice,
            ema7: indicators.ema7,
            ema25: indicators.ema25,
            rsi: indicators.rsi,
            signal: signal,
            signalText: reason,
            timestamp: admin.database.ServerValue.TIMESTAMP
        });

        // Solo reportar log si hay una señal o cambio importante
        if (signal !== 'NEUTRAL') {
            await this.db.ref('logs').push({
                message: reason,
                signal: signal,
                price: indicators.currentPrice,
                timestamp: admin.database.ServerValue.TIMESTAMP
            });
        }
    }

    async logStatus(analysis) {
        const { signal, reason, indicators } = analysis;
        const price = indicators.currentPrice.toFixed(2);

        console.log(chalk.cyan(`\n[${new Date().toLocaleTimeString()}] Monitoreando ${this.symbol}`));
        console.log(`Precio Actual: ${chalk.yellow(price)} USDT`);
        console.log(`EMA7: ${indicators.ema7.toFixed(2)} | EMA25: ${indicators.ema25.toFixed(2)} | RSI: ${indicators.rsi.toFixed(2)}`);

        if (signal === 'BUY') {
            console.log(chalk.bgGreen.black(` SEÑAL DE COMPRA `) + ` ${reason}`);
        } else if (signal === 'SELL') {
            console.log(chalk.bgRed.white(` SEÑAL DE VENTA `) + ` ${reason}`);
        } else {
            console.log(chalk.gray(`ESTADO: ${signal} - ${reason}`));
        }
    }

    async trade() {
        try {
            const prices = await this.fetchPrices();
            if (!prices) return;

            const analysis = analyze(prices);
            await this.logStatus(analysis);
            await this.reportToFirebase(analysis);

            // Gestión de Entrada/Salida compatible con lo anterior
            if (analysis.signal === 'BUY' && !this.isTrading) {
                console.log(chalk.green('>>> Ejecutando entrada automatizada...'));
                this.isTrading = true;
                this.currentPosition = { entryPrice: analysis.indicators.currentPrice };
                if (this.db) {
                    await this.db.ref('logs').push({
                        message: `POSICIÓN ABIERTA a ${analysis.indicators.currentPrice.toFixed(2)} USDT`,
                        signal: 'BUY',
                        timestamp: admin.database.ServerValue.TIMESTAMP
                    });
                }
            }

            if (this.isTrading && analysis.signal === 'SELL') {
                console.log(chalk.red('>>> Ejecutando salida automatizada por estrategia...'));
                const profit = analysis.indicators.currentPrice - this.currentPosition.entryPrice;
                console.log(chalk.bold.yellow(`POSICIÓN CERRADA. Profit/Loss: ${profit.toFixed(2)} USDT`));
                this.isTrading = false;
                this.currentPosition = null;
                if (this.db) {
                    await this.db.ref('logs').push({
                        message: `POSICIÓN CERRADA. P/L: ${profit.toFixed(2)} USDT`,
                        signal: 'SELL',
                        timestamp: admin.database.ServerValue.TIMESTAMP
                    });
                }
            }

        } catch (error) {
            console.error(chalk.red('Error en ciclo de trading:'), error.message);
        }
    }

    start(intervalMs = 30000) {
        console.log(chalk.green(`Iniciando Bot en modo ${this.exchange.sandboxMode ? 'TESTNET' : 'REAL'}`));
        setInterval(() => this.trade(), intervalMs);
        this.trade(); // Ejecución inmediata
    }
}

module.exports = TradingBot;
