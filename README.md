# Alpha-Senior Trading Bot 🚀

Bot de trading autónomo para Binance con estrategia "Senior" (EMA + RSI) y Dashboard web en tiempo real con Firebase.

## 🛠️ Configuración Rápida

1. **Clonar este repositorio** (o subir tu carpeta `binance` a GitHub).
2. **Variables de Entorno**: Configura las siguientes variables en tu hosting (Railway/Render) o archivo `.env`:
   - `BINANCE_API_KEY`: Tu llave de Binance.
   - `BINANCE_SECRET_KEY`: Tu secreto de Binance.
   - `USE_TESTNET`: `true` para pruebas, `false` para real.
   - `FIREBASE_DATABASE_URL`: URL de tu Realtime Database.
   - `FIREBASE_SERVICE_ACCOUNT_PATH`: `./firebase-key.json`.
3. **Firebase**: Sube tu archivo `firebase-key.json` a la raíz del proyecto.

## 🚀 Despliegue

### Backend (Bot)
- Conecta este repo a **Railway.app** o **Render.com**.
- Comando de inicio: `npm start`.

### Frontend (Dashboard)
- Despliega la carpeta `public/` en **Vercel** o **Hostinger**.
- Asegúrate de actualizar la configuración de Firebase en `public/app.js`.

## 📈 Estrategia Técnica
- **Cruce de Medias (EMA 7/25)**: Determina la dirección de la tendencia.
- **RSI (14)**: Evita entrar en zonas de sobre-extensión (sobrecompra/sobreventa).
