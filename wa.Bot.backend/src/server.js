// server.js

require('dotenv').config({
  path: require('path').join(__dirname, '../.env')
});

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────────────────────
// Middlewares
// ─────────────────────────────────────────────────────────────

app.use(cors());

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────────────────
// Middleware Seguridad Admin
// ─────────────────────────────────────────────────────────────

const adminAuth = (req, res, next) => {

  const key = req.headers['x-admin-key'];

  if (key && key === process.env.ADMIN_SECRET_KEY) {
    return next();
  }

  return res.status(403).json({
    error: 'Acceso denegado'
  });
};

// ─────────────────────────────────────────────────────────────
// Importaciones
// ─────────────────────────────────────────────────────────────

const webhookRoutes = require('./routes/webhook');

const conversationRoutes = require('./routes/conversations');
const contactsRoutes = require('./routes/contacts');
const campaignRoutes = require('./routes/campaigns');

// ─────────────────────────────────────────────────────────────
// Health checks
// ─────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    project: 'WA.Bot'
  });
});

app.get('/health/db', (req, res) => {
  res.json({
    status: 'ok'
  });
});

app.get('/health/whatsapp', (req, res) => {
  res.json({
    status: 'ok'
  });
});

// ─────────────────────────────────────────────────────────────
// Webhook WhatsApp
// IMPORTANTE:
// Solo dejamos UNA definición del webhook
// ─────────────────────────────────────────────────────────────

app.use('/webhook', webhookRoutes);

// ─────────────────────────────────────────────────────────────
// Webhook test opcional
// ─────────────────────────────────────────────────────────────

app.get('/webhook-test', (req, res) => {

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('[Webhook-Test] Query:', req.query);

  if (
    mode === 'subscribe' &&
    token === process.env.VERIFY_TOKEN
  ) {
    console.log('[Webhook-Test] ✅ Verificación correcta');

    return res.status(200).send(challenge);
  }

  console.log('[Webhook-Test] ❌ Verificación fallida');

  return res.sendStatus(403);
});

// ─────────────────────────────────────────────────────────────
// APIs
// ─────────────────────────────────────────────────────────────

app.use('/api/conversations', conversationRoutes);

app.use('/api/contacts', contactsRoutes);

app.use('/api/campaigns', campaignRoutes);

// ─────────────────────────────────────────────────────────────
// Admin
// ─────────────────────────────────────────────────────────────

// ⚠️ Ahora mismo es solo respuesta fake.
// No reinicia realmente el servicio.

app.post('/api/admin/restart', adminAuth, async (req, res) => {

  try {

    console.log('[Admin] Solicitud reinicio');

    return res.json({
      success: true,
      message: 'Servicio reiniciado'
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      error: 'Error reiniciando servicio'
    });
  }

});

// ⚠️ Ahora mismo es solo respuesta fake.
// No limpia DB realmente.

app.post('/api/admin/clear-db', adminAuth, async (req, res) => {

  try {

    console.log('[Admin] Solicitud limpiar DB');

    return res.json({
      success: true,
      message: 'Base de datos limpiada'
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      error: 'Error limpiando base de datos'
    });
  }

});

// ─────────────────────────────────────────────────────────────
// Inicio servidor
// ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {

  console.log(`[Server] WA.Bot corriendo en puerto ${PORT}`);

});