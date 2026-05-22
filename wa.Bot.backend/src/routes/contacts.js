// routes/contacts.js

const express = require('express');
const router  = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/contacts — lista de contactos con conteo de conversaciones
router.get('/', async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      include: { _count: { select: { conversations: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json(contacts.map(c => ({
      id:                c.id,
      name:              c.name,
      phone:             c.phone,
      createdAt:         c.createdAt,
      conversationCount: c._count.conversations
    })));
  } catch (err) {
    console.error('[API] Error obteniendo contactos:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;