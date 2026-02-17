/**
 * app.js
 * Lógica del frontend para el bot de trading.
 */

// CONFIGURACIÓN DE FIREBASE: El usuario debe completar esto.
const firebaseConfig = {
    apiKey: "AIzaSyBBwRa9CfYr-qPH-IVMLoL2BUDG-JW___A",
    authDomain: "oasis-datos-jduriilskfuqhsndlf.firebaseapp.com",
    databaseURL: "https://oasis-datos-jduriilskfuqhsndlf-default-rtdb.firebaseio.com",
    projectId: "oasis-datos-jduriilskfuqhsndlf",
    storageBucket: "oasis-datos-jduriilskfuqhsndlf.firebasestorage.app",
    messagingSenderId: "327302100782",
    appId: "1:327302100782:web:2d3287778af1184dc0acbf"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// Elementos del DOM
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userProfile = document.getElementById('userProfile');
const mainContent = document.getElementById('mainContent');
const userName = document.getElementById('userName');

const priceEl = document.getElementById('currentPrice');
const ema7El = document.getElementById('ema7');
const ema25El = document.getElementById('ema25');
const rsiEl = document.getElementById('rsi');
const statusEl = document.getElementById('botStatus');
const logsEl = document.getElementById('logs');

// --- Autenticación ---

loginBtn.onclick = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
};

logoutBtn.onclick = () => auth.signOut();

auth.onAuthStateChanged(user => {
    if (user) {
        loginBtn.style.display = 'none';
        userProfile.style.display = 'flex';
        userName.innerText = user.displayName;
        mainContent.style.opacity = '1';
        mainContent.style.pointerEvents = 'all';
        startListening();
    } else {
        loginBtn.style.display = 'flex';
        userProfile.style.display = 'none';
        mainContent.style.opacity = '0.3';
        mainContent.style.pointerEvents = 'none';
    }
});

// --- Escucha de Datos en Tiempo Real ---

function startListening() {
    // Sincronizar estado actual del bot
    db.ref('botStatus').on('value', snapshot => {
        const data = snapshot.val();
        if (data) {
            priceEl.innerText = data.currentPrice.toFixed(2);
            ema7El.innerText = data.ema7.toFixed(2);
            ema25El.innerText = data.ema25.toFixed(2);
            rsiEl.innerText = data.rsi.toFixed(2);
            statusEl.innerText = data.signalText || 'Monitoreando...';

            // Colores dinámicos para el precio
            priceEl.style.color = data.signal === 'BUY' ? '#00ff88' : (data.signal === 'SELL' ? '#ff3e3e' : '#00f2ff');
        }
    });

    // Escuchar nuevos logs
    db.ref('logs').limitToLast(20).on('child_added', snapshot => {
        const log = snapshot.val();
        addLogToUI(log);
    });
}

function addLogToUI(log) {
    const div = document.createElement('div');
    div.className = 'log-entry';
    const time = new Date(log.timestamp).toLocaleTimeString();

    let typeClass = '';
    if (log.signal === 'BUY') typeClass = 'log-buy';
    if (log.signal === 'SELL') typeClass = 'log-sell';

    div.innerHTML = `
        <span class="log-time">[${time}]</span>
        <span class="${typeClass}">${log.message}</span>
    `;

    logsEl.prepend(div);
}
