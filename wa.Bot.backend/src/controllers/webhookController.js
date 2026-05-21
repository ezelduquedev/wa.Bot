// controllers/webhookController.js

const crypto = require('crypto');
const { findOrCreateContact, findOrCreateConversation, saveMessage, getConversationHistory } = require('../services/dbService');
const { sendWhatsAppMessage }   = require('../services/whatsappService');
const { generateGeminiResponse } = require('../services/geminiService');
const { buildStaticResponse }    = require('../services/responseService'); // fallback

// ── Verificación del webhook (handshake Meta) ─────────────────────────────────
const verifyWebhook = (req, res) => {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('[Webhook] Verificación recibida | token:', token);

  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    console.log('[Webhook] Verificado correctamente por Meta');
    return res.status(200).send(challenge);
  }

  console.warn('[Webhook] Verificación fallida — token incorrecto');
  return res.sendStatus(403);
};

// ── Validación firma HMAC-SHA256 ──────────────────────────────────────────────
const validateSignature = (req) => {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) return false;

  if (!process.env.META_APP_SECRET) {
    console.warn('[Webhook] META_APP_SECRET no configurado — saltando validación HMAC');
    return true;
  }

  const expected = 'sha256=' + crypto
    .createHmac('sha256', process.env.META_APP_SECRET)
    .update(req.rawBody)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
};

// ── Recepción y procesamiento de mensajes ─────────────────────────────────────
const receiveMessage = async (req, res) => {
  // Meta exige 200 OK inmediatamente para evitar reintentos por timeout
  res.sendStatus(200);

  const body = req.body;

  // 🚀 LOG CRÍTICO DE ENTRADA: Esto pintará en Railway TODO lo que mande Meta
  console.log('[Webhook] Petición POST recibida en /webhook');
  console.log('[Webhook] Payload completo de Meta:', JSON.stringify(body, null, 2));

  // TEMP: HMAC comentado para test local (activar en producción con META_APP_SECRET)
  // if (!validateSignature(req)) {
  //   console.warn('[Webhook] Firma HMAC inválida — petición ignorada');
  //   return;
  // }

  // Filtro de seguridad con log si no coincide
  if (!body || body.object !== 'whatsapp_business_account') {
    console.warn(`[Webhook] Objeto no reconocido o vacío. Se esperaba 'whatsapp_business_account' y se recibió: '${body?.object}'`);
    return;
  }

  try {
    const changes = body.entry?.[0]?.changes?.[0]?.value;
    
    // Validar si el cambio contiene mensajes (Meta también envía notificaciones de entrega/lectura)
    const messages = changes?.messages;
    if (!messages || messages.length === 0) {
      console.log('[Webhook] Notificación de estado (status/delivery/read) recibida — ignorando procesamiento de texto.');
      return;
    }

    const message = messages[0];

    if (message.type !== 'text') {
      console.log(`[Webhook] Tipo no soportado: ${message.type} — ignorado`);
      return;
    }

    const phoneNumber = message.from;
    const text        = message.text.body;
    const waMessageId = message.id;
    const timestamp   = new Date(parseInt(message.timestamp) * 1000);

    console.log(`[Webhook] ← Procesando mensaje de ${phoneNumber}: "${text}"`);

    // 1. Buscar o crear contacto
    const contact = await findOrCreateContact(phoneNumber);

    // 2. Buscar conversación abierta o crear nueva
    const conversation = await findOrCreateConversation(contact.id);

    // 3. Guardar mensaje del usuario
    await saveMessage({
      conversationId: conversation.id,
      role:           'USER',
      content:        text,
      waMessageId,
      timestamp,
    });

    console.log(`[DB] Mensaje USER guardado | conversación: ${conversation.id}`);

    // 4. Recuperar historial previo (Limitamos a los últimos 10 mensajes)
    const history = await getConversationHistory(conversation.id, 10);
    
    // OJO: Si tu DB ya ordena de más nuevo a más viejo (DESC), el mensaje recién guardado es history[0].
    // Si ordena de más viejo a más nuevo (ASC), el recién guardado es el último.
    // Para curarnos en salud y evitar enviar duplicados a Gemini, filtramos por el waMessageId actual:
    const historyForGemini = history.filter(msg => msg.waMessageId !== waMessageId);

    // 5. Generar respuesta con Gemini (con fallback a respuesta estática)
    let responseText;
    try {
      console.log(`[Gemini] Enviando historial (${historyForGemini.length} mensajes filtrados) + mensaje actual`);
      responseText = await generateGeminiResponse(historyForGemini, text);
    } catch (geminiError) {
      console.error('[Gemini] Error — usando respuesta estática como fallback:', geminiError.message);
      responseText = buildStaticResponse(text);
    }

    // 6. Enviar respuesta por WhatsApp
    let botWaMessageId = null;
    try {
      botWaMessageId = await sendWhatsAppMessage(phoneNumber, responseText);
      console.log(`[WhatsApp] → Respuesta enviada a ${phoneNumber}`);
    } catch (sendError) {
      console.error('[WhatsApp] Error al enviar respuesta:', sendError.response?.data || sendError.message);
    }

    // 7. Guardar respuesta del bot en BD con role ASSISTANT
    await saveMessage({
      conversationId: conversation.id,
      role:           'ASSISTANT',
      content:        responseText,
      waMessageId:    botWaMessageId || null,
      timestamp:      new Date(),
    });

    console.log(`[DB] Mensaje ASSISTANT guardado | conversación: ${conversation.id}`);
    console.log(`[Webhook] ✓ Ciclo completo para ${phoneNumber}`);

  } catch (error) {
    console.error('[Webhook] Error crítico procesando mensaje:', error);
  }
};

module.exports = { verifyWebhook, receiveMessage };