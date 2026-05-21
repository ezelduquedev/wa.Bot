// server.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// ── Middleware Oficial: Parseo de JSON + Captura de rawBody ──
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf; 
  }
}));
app.use(express.urlencoded({ extended: true }));

// ── Middleware de Seguridad ──
const adminAuth = (req, res, next) => {
  const key = req.headers['x-admin-key'];
  if (key && key === process.env.ADMIN_SECRET_KEY) {
    next();
  } else {
    res.status(403).json({ error: 'Acceso denegado' });
  }
};

// ── Importaciones ──────────────────────────────────────────────────────────
const webhookController = require('./controllers/webhookController');
const webhookRoutes = require('./routes/webhook');
const conversationRoutes = require('./routes/conversations');
const campaignRoutes = require('./routes/campaigns');

// ── Rutas ──────────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'ok', project: 'WA.Bot' }));

// Health Checks
app.get('/health/db', (req, res) => res.json({ status: 'ok' }));
app.get('/health/whatsapp', (req, res) => res.json({ status: 'ok' }));

// ── Rutas Webhook ──────────────────────────────────────────────────────────
// Ruta de verificación (GET) para Meta
app.get('/webhook-test', (req, res) => {
  const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Ruta de eventos (POST): Solo ejecuta la lógica de recepción, NO de verificación
app.post('/webhook-test', (req, res) => {
  // Pasamos el control al controller solo para procesar el cuerpo (mensajes)
  webhookController.receiveMessage(req, res);
});

// Rutas Estándar
app.use('/webhook', webhookRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/campaigns', campaignRoutes);

// ── Rutas Administrativas ──────────────────────────────────────────────────
app.post('/api/admin/restart', adminAuth, (req, res) => {
  res.json({ message: 'Servicio reiniciado' });
});

app.post('/api/admin/clear-db', adminAuth, (req, res) => {
  res.json({ message: 'Base de datos limpiada' });
});

app.listen(PORT, () => {
  console.log(`[Server] WA.Bot corriendo en puerto ${PORT}`);
});