// routes/webhook.js

const express = require('express');

const router = express.Router();

const {
  verifyWebhook,
  receiveMessage
} = require('../controllers/webhookController');

// Verificación Meta
router.get('/', verifyWebhook);

// Mensajes entrantes
router.post('/', receiveMessage);

module.exports = router;