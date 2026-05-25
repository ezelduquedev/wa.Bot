// services/groqService.js

const Groq = require('groq-sdk');
const { sendAppointmentEmails } = require('./emailService');
const { closeConversation } = require('./dbService'); // ← nuevo

const SYSTEM_PROMPT = `
Eres el asistente comercial de Ezel Dev, una agencia especializada en desarrollo web, apps, automatización y soluciones digitales para empresas.

Tu objetivo es:
- Entender qué necesita el cliente.
- Hacer preguntas útiles y naturales.
- Guiar la conversación hacia agendar una llamada.
- Hablar como una persona real por WhatsApp.

Servicios disponibles:
- Desarrollo web
- Apps móviles
- Chatbots y automatización
- Integraciones y APIs
- Consultoría tecnológica
- Soluciones digitales para empresas

Normas de conversación:
- Respuestas cortas: máximo 2-4 frases.
- Usa un tono cercano y profesional.
- Usa emojis solo ocasionalmente.
- Nunca uses markdown.
- Una pregunta por mensaje.
- No inventes precios ni plazos.
- Si no sabes algo, indica que un agente continuará la conversación.

Cuando hables sobre servicios:
- Webs: pregunta objetivo de la web y tipo de negocio.
- Apps: pregunta para qué sería la app y plataformas.
- Chatbots: pregunta qué quieren automatizar.
- Empresas: pregunta qué proceso quieren digitalizar.

Cuando el cliente muestre interés claro, ofrécele agendar una llamada.
NO pidas nombre, email, fecha ni hora — eso lo gestiona el sistema automáticamente.

Información de la empresa:
- Horario: lunes a viernes de 9:00 a 18:00
- Ubicación: Calle Mirabel, 12, Valladolid
- Teléfono: 685 51 14 14
- Web: https://wa-bot-iota.vercel.app/

Habla como una conversación real de WhatsApp. Nunca uses markdown.
`.trim();

const extractEmail = (text) => {
  const m = text.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
  return m ? m[0].toLowerCase() : null;
};

const extractTime = (text) => {
  const m = text.match(/(?:a\s+)?las?\s+(\d{1,2})(?::(\d{2}))?|(\d{1,2}):(\d{2})/i);
  if (!m) return null;
  if (m[3] !== undefined) return `${m[3]}:${m[4]}`;
  return `${m[1]}:${m[2] || '00'}`;
};

const extractDate = (text) => {
  const lower = text.toLowerCase();
  if (/pasado\s+ma[ñn]ana/.test(lower)) return 'pasado mañana';
  if (/ma[ñn]ana/.test(lower)) return 'mañana';
  const days = ['lunes','martes','miércoles','miercoles','jueves','viernes','sábado','sabado','domingo'];
  for (const d of days) {
    if (lower.includes(d)) return d;
  }
  const dm = lower.match(/(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/);
  if (dm) return dm[0];
  return null;
};

const extractName = (text) => {
  const explicit = text.match(/(?:me llamo|soy|mi nombre es)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){0,3})/i);
  if (explicit) return explicit[1].trim();
  const withEmail = text.match(/^([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){0,3})\s*,/);
  if (withEmail) return withEmail[1].trim();
  const isCleanName =
    /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){0,3}$/.test(text.trim()) &&
    !text.includes('@') &&
    !/\d/.test(text);
  if (isCleanName) return text.trim();
  return null;
};

const detectConversationState = (history, userMessage) => {
  const userMessages = [
    ...history.filter(h => h.role === 'USER').map(h => h.content),
    userMessage,
  ];

  const state = {
    interestedService: null,
    appointmentAccepted: false,
    isCollecting: false,
    name: null,
    email: null,
    date: null,
    time: null,
    appointmentCompleted: false,
  };

  for (const msg of userMessages) {
    if (!state.email) state.email = extractEmail(msg);
    if (!state.time)  state.time  = extractTime(msg);
    if (!state.date)  state.date  = extractDate(msg);
    if (!state.name)  state.name  = extractName(msg);
  }

  const fullText = userMessages.join(' ').toLowerCase();

  if (/\bapp\b|ios|android/.test(fullText)) {
    state.interestedService = 'apps';
  } else if (/web|p[aá]gina|tienda\s+online/.test(fullText)) {
    state.interestedService = 'web';
  } else if (/\bbot\b|chatbot/.test(fullText)) {
    state.interestedService = 'chatbots';
  } else if (/empresa|api|automatizaci[oó]n|integraci[oó]n|facturas/.test(fullText)) {
    state.interestedService = 'business';
  }

  const positiveWords = ['si','sí','vale','perfecto','me interesa','quiero','agendar','claro','ok','okay','genial'];
  state.appointmentAccepted = positiveWords.some(w => userMessage.toLowerCase().includes(w));

  state.isCollecting =
    state.appointmentAccepted ||
    !!(state.name || state.email || state.date || state.time);

  if (state.name && state.email && state.date && state.time) {
    state.appointmentCompleted = true;
  }

  return state;
};

const getCollectionResponse = (state) => {
  if (!state.name)  return '¿Cuál es tu nombre completo?';
  if (!state.email) return '¿Cuál es tu correo electrónico?';
  if (!state.date)  return '¿Qué día te viene bien para la llamada?';
  if (!state.time)  return '¿A qué hora te llamo?';
  return null;
};

// ── conversationId es el nuevo parámetro ──────────────────────
const generateGroqResponse = async (history, userMessage, conversationId) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('[Groq] GROQ_API_KEY no configurada');

  const groq = new Groq({ apiKey });
  const state = detectConversationState(history, userMessage);

  console.log('[Groq] Estado:', JSON.stringify(state));

  // ── 1. Cita completa → confirmar, cerrar conversación y enviar email ──
  if (state.appointmentCompleted) {
    sendAppointmentEmails({
      name:  state.name,
      email: state.email,
      date:  state.date,
      time:  state.time,
    });

    // ← Cierra la conversación para que el próximo mensaje empiece limpio
    if (conversationId) {
      await closeConversation(conversationId);
    }

    return (
      `¡Perfecto, ${state.name}! 🙌 Cita confirmada para el ${state.date} a las ${state.time}. ` +
      `Te hemos enviado los detalles a ${state.email}. ¡Hasta entonces!`
    );
  }

  // ── 2. Recogiendo datos → respuesta hardcodeada, sin LLM ──
  if (state.isCollecting) {
    const next = getCollectionResponse(state);
    if (next) return next;
  }

  // ── 3. Conversación libre → LLM ──
  const formattedHistory = history.map(msg => ({
    role:    msg.role === 'USER' ? 'user' : 'assistant',
    content: msg.content,
  }));

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...formattedHistory,
    { role: 'user', content: userMessage },
  ];

  const completion = await groq.chat.completions.create({
    model:       'llama-3.3-70b-versatile',
    messages,
    temperature: 0.4,
    max_tokens:  300,
  });

  const responseText = completion.choices?.[0]?.message?.content?.trim();
  if (!responseText) throw new Error('[Groq] Respuesta vacía');

  console.log(`[Groq] Respuesta LLM (${responseText.length} chars)`);
  return responseText;
};

module.exports = { generateGroqResponse };