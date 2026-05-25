// services/dbService.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────
// Contacto: buscar o crear
// ─────────────────────────────────────────────────────────────

const findOrCreateContact = async (phoneNumber) => {

  let contact = await prisma.contact.findUnique({
    where: { phoneNumber },
  });

  if (!contact) {

    contact = await prisma.contact.create({
      data: { phoneNumber },
    });

    console.log(
      `[DB] Nuevo contacto creado: ${phoneNumber}`
    );
  }

  return contact;
};

// ─────────────────────────────────────────────────────────────
// Conversación: buscar abierta o crear nueva
// ─────────────────────────────────────────────────────────────

const findOrCreateConversation = async (
  contactId
) => {

  let conversation =
    await prisma.conversation.findFirst({

      where: {
        contactId,
        status: 'OPEN'
      },

      orderBy: {
        createdAt: 'desc'
      },
    });

  if (!conversation) {

    conversation =
      await prisma.conversation.create({

        data: {
          contactId,
          status: 'OPEN'
        },
      });

    console.log(
      `[DB] Nueva conversación creada: ${conversation.id}`
    );

  } else {

    conversation =
      await prisma.conversation.update({

        where: {
          id: conversation.id
        },

        data: {
          updatedAt: new Date()
        },
      });

  }

  return conversation;
};

// ─────────────────────────────────────────────────────────────
// Guardar mensaje
// ─────────────────────────────────────────────────────────────

const saveMessage = async ({
  conversationId,
  role,
  content,
  waMessageId,
  timestamp
}) => {

  return prisma.message.create({

    data: {
      conversationId,
      role,
      content,
      waMessageId:
        waMessageId || null,

      timestamp:
        timestamp || new Date(),
    },
  });

};

// ─────────────────────────────────────────────────────────────
// Historial conversación
// ─────────────────────────────────────────────────────────────

const getConversationHistory = async (
  conversationId,
  limit = 10
) => {

  return prisma.message.findMany({

    where: {
      conversationId
    },

    orderBy: {
      timestamp: 'asc'
    },

    take: limit,
  });

};

// ─────────────────────────────────────────────────────────────
// Obtener conversaciones dashboard
// ─────────────────────────────────────────────────────────────

const getConversations = async () => {

  const convos =
    await prisma.conversation.findMany({

      include: {

        contact: true,

        messages: {
          orderBy: {
            timestamp: 'desc'
          },

          take: 1,
        },
      },

      orderBy: {
        updatedAt: 'desc'
      },
    });

  return convos.map((c) => ({

    id: c.id,

    status: c.status,

    createdAt: c.createdAt,

    updatedAt: c.updatedAt,

    contact: {

      id: c.contact.id,

      phone_number:
        c.contact.phoneNumber,

      name:
        c.contact.name || null,
    },

    lastMessage:
      c.messages[0] || null,
  }));

};

// ─────────────────────────────────────────────────────────────
// Obtener mensajes conversación
// ─────────────────────────────────────────────────────────────

const getMessages = async (
  conversationId
) => {

  return prisma.message.findMany({

    where: {
      conversationId
    },

    orderBy: {
      timestamp: 'asc'
    },
  });

};

// ─────────────────────────────────────────────────────────────
// Limpiar Base de Datos
// ─────────────────────────────────────────────────────────────

const clearDatabase = async () => {

  console.log(
    '[DB] Limpiando base de datos...'
  );

  // IMPORTANTE:
  // borrar primero mensajes por relaciones

  await prisma.message.deleteMany();

  await prisma.conversation.deleteMany();

  await prisma.contact.deleteMany();

  console.log(
    '[DB] ✅ Base de datos limpiada'
  );

};

// ─────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────

module.exports = {

  prisma,

  findOrCreateContact,

  findOrCreateConversation,

  saveMessage,

  getConversationHistory,

  getConversations,

  getMessages,

  clearDatabase,
};