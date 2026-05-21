// controllers/webhookController.js

const crypto = require('crypto');
const { findOrCreateContact, findOrCreateConversation, saveMessage, getConversationHistory } = require('../services/dbService');
const { sendWhatsAppMessage } = require('../services/whatsappService');
const { generateGeminiResponse } = require('../services/geminiService');
const { buildStaticResponse } = require('../services/responseService');

// ── 1. Verificación del Webhook (Handshake Meta - GET) ──
const verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    console.log('[Webhook] Verificado correctamente por Meta');
    return res.status(200).send(challenge);
  }
  
  return res.sendStatus(403);
};

// ── 2. Recepción de Eventos (POST) ──
const receiveMessage = async (req, res) => {
  // Siempre respondemos 200 rápido a Meta para cumplir con el timeout
  res.sendStatus(200);

  const body = req.body;

  // Validación básica de estructura
  if (!body || body.object !== 'whatsapp_business_account') {
    return; // Ignoramos peticiones que no son de WhatsApp Business
  }

  try {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0]?.value;
    const messages = changes?.messages;

    // A. Ignorar notificaciones de estado (entrega, lectura)
    if (!messages) {
      // Opcional: console.log('[Webhook] Evento de estado recibido - ignorado');
      return;
    }

    // B. Procesar solo mensajes de texto
    const message = messages[0];
    if (message.type !== 'text') {
      return;
    }

    // C. Ejecutar lógica de negocio
    await processIncomingMessage(message);

  } catch (error) {
    console.error('[Webhook] Error crítico en recepción:', error);
  }
};

// ── Lógica de Procesamiento (Separada para claridad) ──
const processIncomingMessage = async (message) => {
  const phoneNumber = message.from;
  const text = message.text.body;
  const waMessageId = message.id;
  const timestamp = new Date(parseInt(message.timestamp) * 1000);

  console.log(`[Webhook] ← Procesando: ${phoneNumber} | "${text}"`);

  const contact = await findOrCreateContact(phoneNumber);
  const conversation = await findOrCreateConversation(contact.id);

  await saveMessage({
    conversationId: conversation.id,
    role: 'USER',
    content: text,
    waMessageId,
    timestamp,
  });

  const history = await getConversationHistory(conversation.id, 10);
  const historyForGemini = history.filter(msg => msg.waMessageId !== waMessageId);

  let responseText;
  try {
    responseText = await generateGeminiResponse(historyForGemini, text);
  } catch (geminiError) {
    console.error('[Gemini] Fallo, usando fallback');
    responseText = buildStaticResponse(text);
  }

  let botWaMessageId = await sendWhatsAppMessage(phoneNumber, responseText);

  await saveMessage({
    conversationId: conversation.id,
    role: 'ASSISTANT',
    content: responseText,
    waMessageId: botWaMessageId || null,
    timestamp: new Date(),
  });

  console.log(`[Webhook] ✓ Ciclo completo para ${phoneNumber}`);
};

module.exports = { verifyWebhook, receiveMessage };