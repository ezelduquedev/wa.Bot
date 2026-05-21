// services/dbService.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ── Contacto: buscar o crear ──────────────────────────────────────────────────
const findOrCreateContact = async (phoneNumber) => {
  let contact = await prisma.contact.findUnique({
    where: { phoneNumber },
  });

  if (!contact) {
    contact = await prisma.contact.create({
      data: { phoneNumber },
    });
    console.log(`[DB] Nuevo contacto creado: ${phoneNumber}`);
  }

  return contact;
};

// ── Conversacion: buscar abierta o crear nueva ────────────────────────────────
const findOrCreateConversation = async (contactId) => {
  let conversation = await prisma.conversation.findFirst({
    where: { contactId, status: 'OPEN' },
    orderBy: { createdAt: 'desc' },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { contactId, status: 'OPEN' },
    });
    console.log(`[DB] Nueva conversacion creada: ${conversation.id}`);
  } else {
    // Actualizar updatedAt
    conversation = await prisma.conversation.update({
      where: { id: conversation.id },
      data:  { updatedAt: new Date() },
    });
  }

  return conversation;
};

// ── Mensaje: guardar ──────────────────────────────────────────────────────────
const saveMessage = async ({ conversationId, role, content, waMessageId, timestamp }) => {
  return prisma.message.create({
    data: {
      conversationId,
      role,
      content,
      waMessageId: waMessageId || null,
      timestamp:   timestamp   || new Date(),
    },
  });
};

// ── Historial: obtener últimos N mensajes de una conversacion ─────────────────
const getConversationHistory = async (conversationId, limit = 10) => {
  return prisma.message.findMany({
    where:   { conversationId },
    orderBy: { timestamp: 'asc' },
    take:    limit,
  });
};

// ── API dashboard: listar conversaciones ──────────────────────────────────────
const getConversations = async () => {
  const convos = await prisma.conversation.findMany({
    include: {
      contact:  true,
      messages: { orderBy: { timestamp: 'desc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Normalizar para el frontend: exponer lastMessage como objeto y mapear snake_case
  return convos.map((c) => ({
    id:          c.id,
    status:      c.status,
    createdAt:   c.createdAt,
    updatedAt:   c.updatedAt,
    contact: {
      id:           c.contact.id,
      phone_number: c.contact.phoneNumber,
      name:         c.contact.name || null,
    },
    lastMessage: c.messages[0] || null,
  }));
};

// ── API dashboard: mensajes de una conversacion ───────────────────────────────
const getMessages = async (conversationId) => {
  return prisma.message.findMany({
    where:   { conversationId },
    orderBy: { timestamp: 'asc' },
  });
};

module.exports = {
  prisma,
  findOrCreateContact,
  findOrCreateConversation,
  saveMessage,
  getConversationHistory,
  getConversations,
  getMessages,
};