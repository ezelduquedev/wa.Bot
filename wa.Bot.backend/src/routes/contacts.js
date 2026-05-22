// routes/contacts.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      include: { _count: { select: { conversations: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json(contacts.map(c => ({
      id:                c.id,
      name:              c.name,
      // Intentamos capturar el teléfono desde el campo que sea que esté usando tu BD
      phone:             c.phone || c.number || c.phoneNumber || c.id, 
      createdAt:         c.createdAt,
      conversationCount: c._count.conversations
    })));
  } catch (err) {
    console.error('[API] Error obteniendo contactos:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;