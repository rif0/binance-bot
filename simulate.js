/**
 * simulate.js
 * Script para ver el bot en acción con datos simulados.
 * ¡No requiere API Keys ni Firebase!
 */
const { analyze } = require('./strategy');
const chalk = require('chalk');

console.log(chalk.cyan.bold('=== SIMULACIÓN DE ESTRATEGIA SENIOR ==='));
console.log('Generando datos de mercado ficticios...\n');

// Generar una tendencia alcista simulada
let prices = [50000, 50100, 50050, 50200, 50300, 50250, 50400, 50500, 50600, 50550];

function runSim() {
    // Añadir un nuevo precio aleatorio
    const lastPrice = prices[prices.length - 1];
    const change = (Math.random() - 0.45) * 200; // Tendencia ligeramente alcista
    const newPrice = lastPrice + change;
    prices.push(newPrice);

    // Mantener solo los últimos 100 para la EMA
    if (prices.length > 100) prices.shift();

    const analysis = analyze(prices);
    const time = new Date().toLocaleTimeString();

    console.log(`[${time}] Precio: ${chalk.yellow(newPrice.toFixed(2))} USDT`);
    console.log(`EMA7: ${analysis.indicators.ema7.toFixed(2)} | EMA25: ${analysis.indicators.ema25.toFixed(2)} | RSI: ${analysis.indicators.rsi.toFixed(2)}`);

    if (analysis.signal === 'BUY') {
        console.log(chalk.bgGreen.black(' SEÑAL: COMPRA ') + ` - ${analysis.reason}`);
    } else if (analysis.signal === 'SELL') {
        console.log(chalk.bgRed.white(' SEÑAL: VENTA ') + ` - ${analysis.reason}`);
    } else {
        console.log(chalk.gray(`Estado: Neutral - Buscando oportunidad...`));
    }
    console.log('-------------------------------------------');
}

// Correr la simulación cada 2 segundos
console.log('Presiona Ctrl+C para detener.\n');
setInterval(runSim, 2000);
