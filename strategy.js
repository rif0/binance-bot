/**
 * strategy.js
 * Lógica de análisis técnico "Senior".
 */
const chalk = require('chalk');

/**
 * Calcula la Media Móvil Exponencial (EMA)
 */
function calculateEMA(data, period) {
    const k = 2 / (period + 1);
    let ema = data[0];
    for (let i = 1; i < data.length; i++) {
        ema = (data[i] * k) + (ema * (1 - k));
    }
    return ema;
}

/**
 * Calcula el RSI (Relative Strength Index)
 */
function calculateRSI(data, period = 14) {
    if (data.length <= period) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i <= period; i++) {
        const diff = data[data.length - i] - data[data.length - i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

/**
 * Analiza el mercado y devuelve una señal
 * @param {Array} prices - Lista de precios de cierre
 */
function analyze(prices) {
    const ema7 = calculateEMA(prices.slice(-7), 7);
    const ema25 = calculateEMA(prices.slice(-25), 25);
    const rsi = calculateRSI(prices);
    const currentPrice = prices[prices.length - 1];

    let signal = 'NEUTRAL';
    let reason = 'Mercado en rango o sin tendencia clara.';

    // Lógica Senior: Cruce de EMAs + RSI
    if (ema7 > ema25 && rsi < 70) {
        signal = 'BUY';
        reason = `Cruce alcista (EMA7 > EMA25) con RSI en ${rsi.toFixed(2)} (no sobrecomprado).`;
    } else if (ema7 < ema25 && rsi > 30) {
        signal = 'SELL';
        reason = `Cruce bajista (EMA7 < EMA25) con RSI en ${rsi.toFixed(2)} (no sobrevendido).`;
    }

    // Alerta de Extremos
    if (rsi > 80) reason += ' ¡ALERTA! Sobrecompra extrema.';
    if (rsi < 20) reason += ' ¡ALERTA! Sobreventa extrema.';

    return { signal, reason, indicators: { ema7, ema25, rsi, currentPrice } };
}

module.exports = { analyze };
