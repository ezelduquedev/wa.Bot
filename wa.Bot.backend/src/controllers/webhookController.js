// controllers/webhookController.js

const crypto = require('crypto');

const {
  findOrCreateContact,
  findOrCreateConversation,
  saveMessage,
  getConversationHistory
} = require('../services/dbService');

const { sendWhatsAppMessage } = require('../services/whatsappService');

const { generateGeminiResponse } = require('../services/geminiService');

const { buildStaticResponse } = require('../services/responseService');


// ─────────────────────────────────────────────────────────────
// 1. Verificación del Webhook (GET)
// ─────────────────────────────────────────────────────────────

const verifyWebhook = (req, res) => {
  console.log('[Webhook] Verificación GET recibida');

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('[Webhook] mode:', mode);
  console.log('[Webhook] token:', token);

  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    console.log('[Webhook] ✅ Verificado correctamente por Meta');
    return res.status(200).send(challenge);
  }

  console.log('[Webhook] ❌ Verificación fallida');
  return res.sendStatus(403);
};


// ─────────────────────────────────────────────────────────────
// 2. Recepción de Eventos (POST)
// ─────────────────────────────────────────────────────────────

const receiveMessage = async (req, res) => {

  // DEBUG TOTAL
  console.log('\n==============================');
  console.log('[Webhook] POST recibido');
  console.log('==============================\n');

  console.log('[Webhook] Headers:');
  console.log(req.headers);

  console.log('\n[Webhook] Body completo:');
  console.log(JSON.stringify(req.body, null, 2));

  // RESPONDER RÁPIDO A META
  res.sendStatus(200);

  const body = req.body;

  // Validación básica
  if (!body || body.object !== 'whatsapp_business_account') {
    console.log('[Webhook] ⚠️ Evento ignorado: no es WhatsApp Business');
    return;
  }

  try {

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0]?.value;
    const messages = changes?.messages;

    // Ignorar estados
    if (!messages) {
      console.log('[Webhook] ℹ️ Evento de estado recibido (ignorado)');
      return;
    }

    const message = messages[0];

    console.log('\n[Webhook] Mensaje detectado:');
    console.log(JSON.stringify(message, null, 2));

    // Solo texto
    if (message.type !== 'text') {
      console.log('[Webhook] ⚠️ Mensaje no-texto ignorado');
      return;
    }

    // Ejecutar lógica
    await processIncomingMessage(message);

  } catch (error) {

    console.error('\n[Webhook] ❌ ERROR CRÍTICO');
    console.error(error);

  }
};


// ─────────────────────────────────────────────────────────────
// 3. Procesamiento principal
// ─────────────────────────────────────────────────────────────

const processIncomingMessage = async (message) => {

  try {

    const phoneNumber = message.from;
    const text = message.text.body;
    const waMessageId = message.id;
    const timestamp = new Date(parseInt(message.timestamp) * 1000);

    console.log('\n==============================');
    console.log('[Webhook] Procesando mensaje');
    console.log('==============================');

    console.log('Número:', phoneNumber);
    console.log('Texto:', text);
    console.log('WA Message ID:', waMessageId);

    // ── CONTACTO ─────────────────────

    console.log('\n[DB] Buscando/creando contacto...');
    const contact = await findOrCreateContact(phoneNumber);

    console.log('[DB] ✅ Contacto OK:', contact.id);

    // ── CONVERSACIÓN ─────────────────

    console.log('\n[DB] Buscando/creando conversación...');
    const conversation = await findOrCreateConversation(contact.id);

    console.log('[DB] ✅ Conversación OK:', conversation.id);

    // ── GUARDAR MENSAJE USER ─────────

    console.log('\n[DB] Guardando mensaje USER...');

    await saveMessage({
      conversationId: conversation.id,
      role: 'USER',
      content: text,
      waMessageId,
      timestamp,
    });

    console.log('[DB] ✅ Mensaje USER guardado');

    // ── HISTORIAL ────────────────────

    console.log('\n[DB] Obteniendo historial...');

    const history = await getConversationHistory(conversation.id, 10);

    console.log('[DB] Historial obtenido:', history.length);

    const historyForGemini = history.filter(
      msg => msg.waMessageId !== waMessageId
    );

    // ── GEMINI ───────────────────────

    let responseText;

    try {

      console.log('\n[Gemini] Generando respuesta IA...');

      responseText = await generateGeminiResponse(
        historyForGemini,
        text
      );

      console.log('[Gemini] ✅ Respuesta generada');
      console.log('[Gemini] Texto:', responseText);

    } catch (geminiError) {

      console.error('\n[Gemini] ❌ ERROR');
      console.error(geminiError);

      console.log('[Gemini] Usando fallback...');

      responseText = buildStaticResponse(text);

    }

    // ── WHATSAPP SEND ────────────────

    console.log('\n[WhatsApp] Enviando respuesta...');

    let botWaMessageId = null;

    try {

      botWaMessageId = await sendWhatsAppMessage(
        phoneNumber,
        responseText
      );

      console.log('[WhatsApp] ✅ Mensaje enviado');
      console.log('[WhatsApp] Message ID:', botWaMessageId);

    } catch (whatsappError) {

      console.error('\n[WhatsApp] ❌ ERROR ENVÍO');
      console.error(whatsappError);

    }

    // ── GUARDAR RESPUESTA BOT ────────

    console.log('\n[DB] Guardando mensaje ASSISTANT...');

    await saveMessage({
      conversationId: conversation.id,
      role: 'ASSISTANT',
      content: responseText,
      waMessageId: botWaMessageId || null,
      timestamp: new Date(),
    });

    console.log('[DB] ✅ Mensaje ASSISTANT guardado');

    console.log('\n==============================');
    console.log('[Webhook] ✅ CICLO COMPLETO');
    console.log('==============================\n');

  } catch (error) {

    console.error('\n[ProcessIncomingMessage] ❌ ERROR GENERAL');
    console.error(error);

  }
};


module.exports = {
  verifyWebhook,
  receiveMessage
};