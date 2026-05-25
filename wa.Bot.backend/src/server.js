// server.js

require('dotenv').config({
  path: require('path').join(__dirname, '../.env')
});

const express = require('express');
const cors = require('cors');

const {
  clearDatabase
} = require('./services/dbService');

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

app.use(express.urlencoded({
  extended: true
}));

// ─────────────────────────────────────────────────────────────
// Middleware Seguridad Admin
// ─────────────────────────────────────────────────────────────

const adminAuth = (req, res, next) => {

  const key = req.headers['x-admin-key'];

  if (
    key &&
    key === process.env.ADMIN_SECRET_KEY
  ) {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'Acceso denegado'
  });

};

// ─────────────────────────────────────────────────────────────
// Importaciones rutas
// ─────────────────────────────────────────────────────────────

const webhookRoutes =
  require('./routes/webhook');

const conversationRoutes =
  require('./routes/conversations');

const contactsRoutes =
  require('./routes/contacts');

const campaignRoutes =
  require('./routes/campaigns');

// ─────────────────────────────────────────────────────────────
// Ruta principal
// ─────────────────────────────────────────────────────────────

app.get('/', (req, res) => {

  return res.json({

    status: 'ok',

    project: 'WA.Bot',

    environment:
      process.env.NODE_ENV || 'development',
  });

});

// ─────────────────────────────────────────────────────────────
// Health checks
// ─────────────────────────────────────────────────────────────

app.get('/health/db', (req, res) => {

  return res.json({
    status: 'ok'
  });

});

app.get('/health/whatsapp', (req, res) => {

  return res.json({
    status: 'ok'
  });

});

// ─────────────────────────────────────────────────────────────
// Webhook WhatsApp
// IMPORTANTE:
// Solo existe UNA definición
// ─────────────────────────────────────────────────────────────

app.use('/webhook', webhookRoutes);

// ─────────────────────────────────────────────────────────────
// Webhook test opcional
// ─────────────────────────────────────────────────────────────

app.get('/webhook-test', (req, res) => {

  const mode =
    req.query['hub.mode'];

  const token =
    req.query['hub.verify_token'];

  const challenge =
    req.query['hub.challenge'];

  console.log(
    '[Webhook-Test] Query:',
    req.query
  );

  if (
    mode === 'subscribe' &&
    token === process.env.VERIFY_TOKEN
  ) {

    console.log(
      '[Webhook-Test] ✅ Verificación correcta'
    );

    return res
      .status(200)
      .send(challenge);
  }

  console.log(
    '[Webhook-Test] ❌ Verificación fallida'
  );

  return res.sendStatus(403);

});

// ─────────────────────────────────────────────────────────────
// APIs
// ─────────────────────────────────────────────────────────────

app.use(
  '/api/conversations',
  conversationRoutes
);

app.use(
  '/api/contacts',
  contactsRoutes
);

app.use(
  '/api/campaigns',
  campaignRoutes
);

// ─────────────────────────────────────────────────────────────
// Admin
// ─────────────────────────────────────────────────────────────

// ⚠️ En Vercel no existe reinicio manual real

app.post(
  '/api/admin/restart',
  adminAuth,
  async (req, res) => {

    try {

      console.log(
        '[Admin] Solicitud reinicio'
      );

      return res.json({

        success: true,

        message:
          'En Vercel el servicio se reinicia automáticamente en cada deploy.',

      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({

        success: false,

        error:
          'Error procesando reinicio',

      });

    }

  }
);

// ─────────────────────────────────────────────────────────────
// Limpiar Base de Datos REAL
// PostgreSQL + Prisma
// ─────────────────────────────────────────────────────────────

app.post(
  '/api/admin/clear-db',
  adminAuth,
  async (req, res) => {

    try {

      console.log(
        '[Admin] Limpiando base de datos...'
      );

      await clearDatabase();

      return res.json({

        success: true,

        message:
          'Base de datos limpiada correctamente',

      });

    } catch (error) {

      console.error(
        '[Admin] Error limpiando DB'
      );

      console.error(error);

      return res.status(500).json({

        success: false,

        error:
          'Error limpiando base de datos',

      });

    }

  }
);

// ─────────────────────────────────────────────────────────────
// 404 handler
// ─────────────────────────────────────────────────────────────

app.use((req, res) => {

  return res.status(404).json({

    success: false,

    error: 'Ruta no encontrada',

  });

});

// ─────────────────────────────────────────────────────────────
// Error handler global
// ─────────────────────────────────────────────────────────────

app.use((err, req, res, next) => {

  console.error(
    '[Server] Error global'
  );

  console.error(err);

  return res.status(500).json({

    success: false,

    error: 'Error interno servidor',

  });

});

// ─────────────────────────────────────────────────────────────
// Inicio servidor
// ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {

  console.log(
    `[Server] WA.Bot corriendo en puerto ${PORT}`
  );

});