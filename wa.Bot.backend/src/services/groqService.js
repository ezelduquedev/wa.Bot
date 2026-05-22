// services/groqService.js
//
// Migración de Gemini → Groq (llama-3.3-70b-versatile)
// Misma interfaz que geminiService para sustitución directa.

const Groq = require('groq-sdk');

// System prompt — mismo rol que Gemini, mejor redactado.
const SYSTEM_PROMPT = `Eres el asistente virtual de WA.Bot, una plataforma de automatización de WhatsApp para pequeñas empresas.

Atiendes a clientes de forma amable, natural y profesional. Respondes siempre en el idioma del cliente.

Información del negocio:
- Horario: lunes a viernes, de 9:00 a 18:00 h.
- Ubicación: Calle Mirabel, 12, Valladolid.
- Teléfono: 685 51 14 14
- Web: https://wa-bot-iota.vercel.app/

Directrices de respuesta:
- Sé conciso y directo: máximo 3-4 frases por respuesta.
- Escribe de forma conversacional, como lo haría una persona real por WhatsApp.
- Usa emojis con moderación y solo cuando aporten calidez.
- No uses listas con guiones ni markdown. Texto plano con saltos de línea si es necesario.
- Si no tienes información suficiente para responder, indica que un agente se pondrá en contacto.
- Nunca inventes datos, precios ni servicios no mencionados.`;

/**
 * Genera una respuesta usando Groq API con historial de conversación.
 *
 * @param {Array<{role: string, content: string}>} history - Mensajes previos (role: USER | ASSISTANT)
 * @param {string} userMessage - Mensaje actual del usuario
 * @returns {Promise<string>} - Respuesta generada por Groq
 */
const generateGroqResponse = async (history, userMessage) => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('[Groq] GROQ_API_KEY no configurada en .env');
  }

  const groq = new Groq({ apiKey });

  // Convertir historial de BD (USER/ASSISTANT) al formato de Groq (user/assistant)
  const formattedHistory = history.map(msg => ({
    role:    msg.role === 'USER' ? 'user' : 'assistant',
    content: msg.content,
  }));

  // Construir array de mensajes: system + historial + mensaje actual
  const messages = [
    { role: 'system',    content: SYSTEM_PROMPT },
    ...formattedHistory,
    { role: 'user',      content: userMessage },
  ];

  const completion = await groq.chat.completions.create({
    model:       'llama-3.3-70b-versatile',
    messages,
    max_tokens:  300,   // suficiente para WhatsApp, evita respuestas largas
    temperature: 0.6,   // equilibrio entre creatividad y coherencia
  });

  const responseText = completion.choices[0]?.message?.content?.trim();

  if (!responseText) {
    throw new Error('[Groq] Respuesta vacía del modelo');
  }

  console.log(`[Groq] Respuesta generada (${responseText.length} chars)`);
  return responseText;
};

module.exports = { generateGroqResponse };