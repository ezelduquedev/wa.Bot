// services/groqService.js

const Groq = require('groq-sdk');

// ─────────────────────────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `
Eres el asistente comercial de Ezel Dev, una agencia especializada en desarrollo web, apps, automatización y soluciones digitales para empresas.

Tu objetivo es:
- Entender qué necesita el cliente.
- Hacer preguntas útiles y naturales.
- Guiar la conversación hacia agendar una llamada.
- No repetir preguntas ya respondidas.
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
- Nunca hagas demasiadas preguntas a la vez. Una pregunta por mensaje.
- Si el usuario ya mostró interés en un servicio, profundiza en ese servicio.
- Si el usuario acepta una llamada, NO vuelvas a preguntar qué necesita.
- Si el usuario acepta una llamada, pide directamente nombre, email y disponibilidad horaria, DE UNO EN UNO.
- Si ya tienes nombre, email, fecha y hora: confirma la cita y TERMINA el flujo.
- Nunca vuelvas a ofrecer una llamada si ya está confirmada.
- No inventes precios ni plazos.
- Si no sabes algo, indica que un agente continuará la conversación.

Cuando hables sobre servicios:
- Webs: pregunta objetivo de la web y tipo de negocio.
- Apps: pregunta para qué sería la app y plataformas.
- Chatbots: pregunta qué quieren automatizar.
- Empresas: pregunta qué proceso quieren digitalizar.

Información de la empresa:
- Horario: lunes a viernes de 9:00 a 18:00
- Ubicación: Calle Mirabel, 12, Valladolid
- Teléfono: 685 51 14 14
- Web: https://wa-bot-iota.vercel.app/

Habla como una conversación real de WhatsApp. Nunca uses markdown.
`.trim();

// ─────────────────────────────────────────────────────────────
// EXTRACTORES — devuelven el valor real, no solo un booleano
// ─────────────────────────────────────────────────────────────

const extractEmail = (text) => {
  const m = text.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
  return m ? m[0].toLowerCase() : null;
};

/**
 * Detecta horas en formatos:
 *   "a las 11", "las 11:30", "11:00", "11h", "a las 9 de la mañana"
 */
const extractTime = (text) => {
  const m = text.match(
    /(?:a\s+)?las?\s+(\d{1,2})(?::(\d{2}))?|(\d{1,2}):(\d{2})/i
  );
  if (!m) return null;
  // Formato explícito HH:MM
  if (m[3] !== undefined) return `${m[3]}:${m[4]}`;
  // Formato "las X" con o sin minutos
  const h = m[1];
  const min = m[2] || '00';
  return `${h}:${min}`;
};

/**
 * Detecta fechas: mañana, pasado mañana, días de semana, "27 de mayo"
 */
const extractDate = (text) => {
  const lower = text.toLowerCase();
  if (/pasado\s+ma[ñn]ana/.test(lower)) return 'pasado mañana';
  if (/ma[ñn]ana/.test(lower)) return 'mañana';

  const days = [
    'lunes', 'martes', 'miércoles', 'miercoles',
    'jueves', 'viernes', 'sábado', 'sabado', 'domingo',
  ];
  for (const d of days) {
    if (lower.includes(d)) return d;
  }

  const dm = lower.match(
    /(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/
  );
  if (dm) return dm[0];

  return null;
};

/**
 * Detecta nombres con prefijos explícitos ("me llamo X", "soy X")
 * o bien un patrón "Nombre Apellido" cuando ya tenemos email
 * (el usuario suele enviar: "Nombre Apellido, email@x.com, hora")
 */
const extractName = (text) => {
  // Patrones con prefijo
  const explicit = text.match(
    /(?:me llamo|soy|mi nombre es)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){0,3})/i
  );
  if (explicit) return explicit[1].trim();

  // Patrón "Nombre Apellido, email" (el usuario manda todo junto)
  const withEmail = text.match(
    /^([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){0,3})\s*,/
  );
  if (withEmail) return withEmail[1].trim();

  return null;
};

// ─────────────────────────────────────────────────────────────
// DETECTOR DE ESTADO — escanea solo mensajes del usuario
// ─────────────────────────────────────────────────────────────

const detectConversationState = (history, userMessage) => {
  // Solo los mensajes del usuario, en orden
  const userMessages = [
    ...history.filter(h => h.role === 'USER').map(h => h.content),
    userMessage,
  ];

  const state = {
    interestedService: null,
    appointmentAccepted: false,
    name: null,
    email: null,
    date: null,
    time: null,
    appointmentCompleted: false,
  };

  // Extraer datos recorriendo cada mensaje (primero en ganar)
  for (const msg of userMessages) {
    if (!state.email) state.email = extractEmail(msg);
    if (!state.time)  state.time  = extractTime(msg);
    if (!state.date)  state.date  = extractDate(msg);
    if (!state.name)  state.name  = extractName(msg);
  }

  // Detección de servicio (en todo el texto de usuario)
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

  // Intención positiva (solo en el mensaje actual)
  const positiveWords = [
    'si', 'sí', 'vale', 'perfecto', 'me interesa',
    'quiero', 'agendar', 'claro', 'ok', 'okay', 'genial',
  ];
  state.appointmentAccepted = positiveWords.some(w =>
    userMessage.toLowerCase().includes(w)
  );

  // Cita completa: necesita los 4 datos
  if (state.name && state.email && state.date && state.time) {
    state.appointmentCompleted = true;
  }

  return state;
};

// ─────────────────────────────────────────────────────────────
// PROMPT DE ESTADO — le dice al modelo exactamente qué falta
// ─────────────────────────────────────────────────────────────

const buildStatePrompt = (state) => {
  const collected = [];
  const missing   = [];

  if (state.name)  collected.push(`nombre: "${state.name}"`);
  else             missing.push('nombre');

  if (state.email) collected.push(`email: "${state.email}"`);
  else             missing.push('email');

  if (state.date)  collected.push(`fecha: "${state.date}"`);
  else             missing.push('fecha');

  if (state.time)  collected.push(`hora: "${state.time}"`);
  else             missing.push('hora');

  const lines = [];

  if (collected.length) {
    lines.push(`Datos ya recogidos → ${collected.join(' | ')}`);
    lines.push('NO vuelvas a preguntar por estos datos.');
  }

  if (missing.length && state.appointmentAccepted) {
    lines.push(`Datos que faltan → ${missing.join(', ')}`);
    lines.push('Pide SOLO el primero de la lista. Una pregunta por mensaje.');
  }

  if (state.interestedService) {
    lines.push(`Servicio de interés: ${state.interestedService}`);
  }

  return lines.join('\n');
};

// ─────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL
// ─────────────────────────────────────────────────────────────

const generateGroqResponse = async (history, userMessage) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('[Groq] GROQ_API_KEY no configurada');

  const groq = new Groq({ apiKey });
  const state = detectConversationState(history, userMessage);

  console.log('[Groq] Estado detectado:', JSON.stringify(state));

  // ── Respuesta controlada cuando la cita está completa ──
  if (state.appointmentCompleted) {
    return (
      `¡Perfecto, ${state.name}! 🙌 Cita confirmada para el ${state.date} a las ${state.time}. ` +
      `Te enviaremos los detalles a ${state.email}. ¡Hasta entonces!`
    );
  }

  // ── Construcción de mensajes para Groq ────────────────
  const formattedHistory = history.map(msg => ({
    role:    msg.role === 'USER' ? 'user' : 'assistant',
    content: msg.content,
  }));

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'system', content: buildStatePrompt(state) },
    ...formattedHistory,
    { role: 'user', content: userMessage },
  ];

  const completion = await groq.chat.completions.create({
    model:       'llama-3.3-70b-versatile',
    messages,
    temperature: 0.3,
    max_tokens:  300,
  });

  const responseText = completion.choices?.[0]?.message?.content?.trim();
  if (!responseText) throw new Error('[Groq] Respuesta vacía');

  console.log(`[Groq] Respuesta generada (${responseText.length} chars)`);

  return responseText;
};

module.exports = { generateGroqResponse };