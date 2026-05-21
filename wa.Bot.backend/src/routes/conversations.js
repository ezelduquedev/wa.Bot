// routes/conversations.js

const express = require('express');
const router  = express.Router();
const { getConversations, getMessages } = require('../services/dbService');

// GET /api/conversations — lista de conversaciones para el dashboard
router.get('/', async (req, res) => {
  try {
    const conversations = await getConversations();
    res.json(conversations);
  } catch (error) {
    console.error('[API] Error obteniendo conversaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/conversations/:id/messages — mensajes de una conversacion
router.get('/:id/messages', async (req, res) => {
  try {
    const messages = await getMessages(req.params.id);
    res.json(messages);
  } catch (error) {
    console.error('[API] Error obteniendo mensajes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;