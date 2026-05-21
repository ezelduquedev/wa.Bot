// services/whatsappService.js

const axios = require('axios');

/**
 * Envía un mensaje de texto libre al número indicado.
 * Funciona en producción con cuenta Business verificada.
 * En sandbox solo llega si el usuario escribió primero (ventana 24h).
 */
const sendWhatsAppMessage = async (to, text) => {
  const phoneNumberId = process.env.PHONE_NUMBER_ID;
  const accessToken   = process.env.META_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new Error('[WhatsApp] Faltan variables de entorno: PHONE_NUMBER_ID o META_ACCESS_TOKEN');
  }

  const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type:    'individual',
    to,
    type: 'text',
    text: { body: text },
  };

  const response = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const waMessageId = response.data?.messages?.[0]?.id;
  console.log(`[WhatsApp] Mensaje enviado a ${to} | wa_message_id: ${waMessageId}`);
  return waMessageId;
};

/**
 * Envía un template aprobado por Meta al número indicado.
 * Necesario en sandbox (hello_world) y para iniciar conversaciones
 * fuera de la ventana de 24h en producción.
 */
const sendTemplateMessage = async (to, templateName = 'hello_world', languageCode = 'en_US') => {
  const phoneNumberId = process.env.PHONE_NUMBER_ID;
  const accessToken   = process.env.META_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new Error('[WhatsApp] Faltan variables de entorno: PHONE_NUMBER_ID o META_ACCESS_TOKEN');
  }

  const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name:     templateName,
      language: { code: languageCode },
    },
  };

  const response = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const waMessageId = response.data?.messages?.[0]?.id;
  console.log(`[WhatsApp] Template "${templateName}" enviado a ${to} | wa_message_id: ${waMessageId}`);
  return waMessageId;
};

module.exports = { sendWhatsAppMessage, sendTemplateMessage };