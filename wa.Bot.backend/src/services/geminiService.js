// services/geminiService.js
//
// Día 5: integración con Gemini API (Google AI Studio).
// Recibe el historial de conversación y el mensaje actual,
// devuelve una respuesta natural generada por el modelo.

const { GoogleGenerativeAI } = require('@google/generative-ai');

// System prompt — define el rol del asistente.
// Personaliza este texto según el negocio real en producción.
const SYSTEM_PROMPT = `Eres el asistente virtual de WA.Bot, una plataforma de automatización de WhatsApp para pequeñas empresas.

Tu rol es atender a los clientes de forma amable, clara y concisa. Responde siempre en el mismo idioma que use el cliente.

Información del negocio:
- Horario: lunes a viernes, 9:00 a 18:00 h.
- Ubicación: Calle Ejemplo 42, Vigo.
- Teléfono: 685 51 14 14
- Web: https://wa.bot

Normas:
- Respuestas cortas y directas, apropiadas para WhatsApp (máximo 3-4 frases).
- No inventes información que no se te haya proporcionado.
- Si no puedes responder algo, indica que un agente humano se pondrá en contacto.
- No uses markdown complejo; puedes usar emojis con moderación.`;

/**
 * Genera una respuesta usando Gemini API con historial de conversación.
 *
 * @param {Array<{role: string, content: string}>} history - Mensajes previos de la conversación (role: USER | ASSISTANT)
 * @param {string} userMessage - Mensaje actual del usuario
 * @returns {Promise<string>} - Respuesta generada por Gemini
 */
const generateGeminiResponse = async (history, userMessage) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('[Gemini] GEMINI_API_KEY no configurada en .env');
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_PROMPT,
  });

  // Convertir historial de BD (USER/ASSISTANT) al formato de Gemini (user/model)
  // Excluimos el mensaje actual — va como input aparte
  const formattedHistory = history.map(msg => ({
    role:  msg.role === 'USER' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  // Iniciar chat con historial previo
  const chat = model.startChat({
    history: formattedHistory,
  });

  // Enviar el mensaje actual y obtener respuesta
  const result = await chat.sendMessage(userMessage);
  const responseText = result.response.text();

  console.log(`[Gemini] Respuesta generada (${responseText.length} chars)`);
  return responseText;
};

module.exports = { generateGeminiResponse };
