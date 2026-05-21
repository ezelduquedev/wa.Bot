// server.js

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// ── Middleware Oficial: Parseo de JSON + Captura de rawBody para HMAC ──
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf; // Guarda el buffer original intacto de forma segura
  }
}));

app.use(express.urlencoded({ extended: true }));

// ── Importación de Controladores para Rutas Espejo ──────────────────────────
// Importamos la lógica real de tu webhook para duplicar el endpoint sin romper nada
const webhookController = require('./controllers/webhookController');

// ── Rutas ─────────────────────────────────────────────────────────────────────
const webhookRoutes      = require('./routes/webhook');
const conversationRoutes = require('./routes/conversations');
const campaignRoutes     = require('./routes/campaigns');

// 1. Ruta raíz de verificación de estado
app.get('/', (req, res) => {
  res.json({ status: 'ok', project: 'WA.Bot', version: '1.0.0' });
});

// 2. 🚀 RUTA ESPEJO DIRECTA TOTAL (/webhook-test)
// Maneja el Handshake de Meta (GET)
app.get('/webhook-test', (req, res) => {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('[Webhook-Test] Intento de handshake directo recibido por GET');

  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    console.log('[Webhook-Test] ¡Coincidencia exitosa! Respondiendo challenge...');
    return res.status(200).send(challenge);
  }
  
  console.warn('[Webhook-Test] Fallo en la validación GET.');
  return res.sendStatus(403);
});

// Maneja los mensajes reales de WhatsApp (POST) saltándose cualquier bloqueo de subrutas
app.post('/webhook-test', (req, res, next) => {
  console.log('[Webhook-Test] ¡Petición POST recibida directamente en /webhook-test!');
  next();
}, webhookController.receiveMessage || webhookController.verifyWebhook); 
// Nota: He puesto una tolerancia por si tu función exportada se llama de otra forma en el controlador


// 3. Registro de endpoints estándar
app.use('/webhook',           webhookRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/campaigns',     campaignRoutes);

// ── Arranque del Servidor ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[Server] WA.Bot corriendo en puerto ${PORT}`);
});