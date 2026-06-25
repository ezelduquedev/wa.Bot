// services/groqService.js
const Groq = require('groq-sdk');
const { sendAppointmentEmails } = require('./emailService');
const { closeConversation }     = require('./dbService');

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

Cuando saludes por primera vez, preséntate así (exactamente):
"Hola, gracias por contactar con Ezel Dev 👋 Trabajamos en desarrollo web, apps móviles, chatbots, automatización y consultoría tecnológica. ¿En qué podemos ayudarte?"

FLUJO OBLIGATORIO cuando el cliente mencione un servicio:
1. Explica brevemente en 2-3 frases qué incluye ese servicio y para qué sirve.
2. Haz UNA pregunta para entender mejor su necesidad concreta.
3. NO pases a recoger nombre/email/fecha hasta que el cliente haya confirmado que quiere agendar una llamada.

Cuando hables sobre servicios:
- Webs: menciona que incluye diseño, desarrollo y posicionamiento. Pregunta qué tipo de negocio tiene y cuál es el objetivo de la web.
- Apps: menciona que trabajamos iOS y Android con tecnologías modernas. Pregunta para qué sería la app y qué problema resuelve.
- Chatbots: menciona que automatizamos atención al cliente 24/7 por WhatsApp o web. Pregunta qué quieren automatizar.
- Empresas/APIs: menciona que integramos sistemas y digitalizamos procesos. Pregunta qué proceso quieren mejorar.

Cuando el cliente confirme que quiere agendar una llamada, responde con algo como:
"¡Perfecto! Para coordinar la llamada necesito algunos datos."
Y a partir de ahí el sistema recoge automáticamente nombre, email, fecha y hora.

Cuando la cita ya esté confirmada y el cliente diga algo como "gracias" o se despida, responde brevemente con un mensaje de cierre amable sin ofrecer más ayuda ni hacer preguntas.

Información de la empresa:
- Horario: lunes a viernes de 9:00 a 18:00
- Ubicación: Calle Mirabel, 12, Valladolid
- Teléfono: 685 51 14 14
- Web: https://wa-bot-iota.vercel.app/

Habla como una conversación real de WhatsApp. Nunca uses markdown.
`.trim();

// ─────────────────────────────────────────────────────────────
// EXTRACTORES
// ─────────────────────────────────────────────────────────────

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
  for (const d of days) { if (lower.includes(d)) return d; }
  const dm = lower.match(/(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/);
  return dm ? dm[0] : null;
};

const NAME_BLACKLIST = new Set([
  'hola','buenas','hello','hi','ok','okay','vale','sí','si','no',
  'gracias','perfecto','claro','genial','bien','bueno','oye','oiga',
  'disculpa','perdona','mañana','pasado','lunes','martes','miércoles',
  'miercoles','jueves','viernes','sábado','sabado','domingo',
]);

const extractName = (text) => {
  const explicit = text.match(/(?:me llamo|soy|mi nombre es)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñA-Za-z]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñA-Za-z]+){0,3})/i);
  if (explicit) return explicit[1].trim();
  const trimmed = text.trim();
  const isCleanName =
    /^[A-ZÁÉÍÓÚÑ][a-záéíóúñA-Za-z]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñA-Za-z]+){0,3}$/.test(trimmed) &&
    !trimmed.includes('@') &&
    !/\d/.test(trimmed) &&
    trimmed.split(' ').length >= 2 &&
    !trimmed.split(' ').some(w => NAME_BLACKLIST.has(w.toLowerCase()));
  return isCleanName ? trimmed : null;
};

// ─────────────────────────────────────────────────────────────
// DETECTOR DE ESTADO
// ─────────────────────────────────────────────────────────────

const detectConversationState = (history, userMessage) => {
  const userMessages = [
    ...history.filter(h => h.role === 'USER').map(h => h.content),
    userMessage,
  ];

  console.log('[Groq] 🔍 Mensajes USER para extracción:', JSON.stringify(userMessages));

  const state = {
    interestedService:    null,
    appointmentAccepted:  false,
    isCollecting:         false,
    name:                 null,
    email:                null,
    date:                 null,
    time:                 null,
    appointmentCompleted: false,
  };

  // ✅ Recorre TODOS los mensajes de usuario acumulando siempre el último valor válido
  for (const msg of userMessages) {
    const foundEmail = extractEmail(msg);
    if (foundEmail) state.email = foundEmail;

    const foundTime = extractTime(msg);
    if (foundTime) state.time = foundTime;

    const foundDate = extractDate(msg);
    if (foundDate) state.date = foundDate;

    const foundName = extractName(msg);
    if (foundName) state.name = foundName;
  }

  console.log('[Groq] 🔍 Regex extrajo — name:', state.name, '| email:', state.email, '| date:', state.date, '| time:', state.time);

  const fullText = userMessages.join(' ').toLowerCase();
  if (/\bapp\b|ios|android/.test(fullText))                                         state.interestedService = 'apps';
  else if (/web|p[aá]gina|tienda\s+online/.test(fullText))                          state.interestedService = 'web';
  else if (/\bbot\b|chatbot/.test(fullText))                                        state.interestedService = 'chatbots';
  else if (/empresa|api|automatizaci[oó]n|integraci[oó]n|facturas/.test(fullText))  state.interestedService = 'business';

  // ✅ appointmentAccepted solo si hay trigger explícito de cita,
  // O positivo suave DESPUÉS de que el bot haya ofrecido la llamada
  const appointmentTriggers = [
    'agendar','agenda','llamada','cita','reservar',
    'cuándo podemos','cuando podemos','me apunto','me interesa una llamada',
  ];
  const softPositive = ['sí','si','vale','perfecto','claro','ok','okay','genial','adelante'];

  const hasAppointmentTrigger = appointmentTriggers.some(w => userMessage.toLowerCase().includes(w));
  const hasSoftPositive = softPositive.some(w => {
    const msg = userMessage.toLowerCase().trim();
    return msg === w || msg.startsWith(w + ' ') || msg.endsWith(' ' + w);
  });
  const assistantOfferedCall = history.some(
    h => h.role === 'ASSISTANT' && /llamada|cita|agendar/i.test(h.content)
  );

  state.appointmentAccepted = hasAppointmentTrigger || (hasSoftPositive && assistantOfferedCall);
  state.isCollecting = state.appointmentAccepted || !!(state.name || state.email || state.date || state.time);
  if (state.name && state.email && state.date && state.time) state.appointmentCompleted = true;

  return state;
};

const getCollectionResponse = (state) => {
  if (!state.name)  return '¿Cuál es tu nombre completo?';
  if (!state.email) return '¿Cuál es tu correo electrónico?';
  if (!state.date)  return '¿Qué día te viene bien para la llamada?';
  if (!state.time)  return '¿A qué hora te llamo?';
  return null;
};

// ─────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL
// ─────────────────────────────────────────────────────────────

const generateGroqResponse = async (history, userMessage, conversationId) => {
  const apiKey = process.env.GROQ_API_KEY;
  const groq   = new Groq({ apiKey });

  // Construimos la conversación en texto plano para que el LLM tenga todo el contexto
  const conversationText = history.map(h => `${h.role === 'USER' ? 'Cliente' : 'Asistente'}: ${h.content}`).join('\n') + `\nCliente: ${userMessage}`;

  // 1. EXTRACCIÓN CON IA — Analiza el historial completo para extraer de forma robusta
  const extractionPrompt = `Analiza la siguiente conversación de WhatsApp entre un asistente comercial y un cliente.
Extrae los siguientes datos si han sido proporcionados por el cliente en algún momento de la conversación:
- name: El nombre propio del cliente (ej. "Juan", "Juan Pérez"). Si se presenta o dice su nombre, extráelo.
- email: El correo electrónico del cliente.
- date: La fecha propuesta para la llamada (ej. "mañana", "lunes", "25 de junio").
- time: La hora propuesta para la llamada (ej. "17:00", "a las 5").
- interestedService: El servicio por el que se interesa ("web", "apps", "chatbots", "business" o null).
- appointmentAccepted: true si el cliente ha aceptado o solicitado explícitamente agendar una llamada/cita; de lo contrario false.

Responde ÚNICAMENTE con un objeto JSON válido con las siguientes claves:
{
  "name": string o null,
  "email": string o null,
  "date": string o null,
  "time": string o null,
  "interestedService": string o null,
  "appointmentAccepted": boolean
}

Conversación:
${conversationText}`;

  let aiExtracted = { name: null, email: null, date: null, time: null, interestedService: null, appointmentAccepted: false };
  try {
    const extraction = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: extractionPrompt }],
      response_format: { type: 'json_object' },
      temperature: 0,
    });
    aiExtracted = JSON.parse(extraction.choices[0].message.content);
    console.log('[Groq] 🤖 IA extrajo del historial completo:', JSON.stringify(aiExtracted));
  } catch (err) {
    console.error('[Groq] Error en extracción con IA:', err);
  }

  // 2. ESTADO CONSOLIDADO (regex sobre historial + IA sobre historial)
  const state = detectConversationState(history, userMessage);

  // IA complementa lo que regex no encontró — nunca sobreescribe valores locales válidos si la IA los tiene
  if (aiExtracted.name)  state.name  = aiExtracted.name;
  if (aiExtracted.email) state.email = aiExtracted.email;
  if (aiExtracted.date)  state.date  = aiExtracted.date;
  if (aiExtracted.time)  state.time  = aiExtracted.time;
  if (aiExtracted.interestedService) state.interestedService = aiExtracted.interestedService;
  if (aiExtracted.appointmentAccepted !== undefined) {
    state.appointmentAccepted = state.appointmentAccepted || aiExtracted.appointmentAccepted;
  }

  state.isCollecting = !!(state.name || state.email || state.date || state.time || state.appointmentAccepted);
  if (state.name && state.email && state.date && state.time) state.appointmentCompleted = true;

  console.log('[Groq] ✅ Estado final consolidado:', JSON.stringify(state));

  // 3. CITA COMPLETA → enviar email y cerrar conversación
  if (state.appointmentCompleted) {
    await sendAppointmentEmails({
      name:  state.name,
      email: state.email,
      date:  state.date,
      time:  state.time,
    });
    if (conversationId) await closeConversation(conversationId);
    return `¡Perfecto, ${state.name}! 🙌 Cita confirmada para el ${state.date} a las ${state.time}. Detalles enviados a ${state.email}.`;
  }

  // 4. RECOGIDA DE DATOS EN CURSO - CON IA DINÁMICA
  // Si está recolectando datos, inyectamos una instrucción especial en el prompt del sistema
  // para que la IA responda cualquier pregunta fuera del guion y pida el dato que falta.
  let systemPromptAdicional = '';
  if (state.isCollecting && !state.appointmentCompleted) {
    systemPromptAdicional = `\n\n[SISTEMA - RECOPILACIÓN DE DATOS DE CITA]
Estamos en el proceso de agendar una llamada.
Datos recolectados hasta ahora:
- Nombre: ${state.name ? state.name : 'FALTA'}
- Email: ${state.email ? state.email : 'FALTA'}
- Fecha: ${state.date ? state.date : 'FALTA'}
- Hora: ${state.time ? state.time : 'FALTA'}

INSTRUCCIONES DE RECOPILACIÓN:
1. Revisa si el cliente ha respondido a alguna de las preguntas anteriores o si ha hecho una pregunta/comentario fuera del guion (por ejemplo: dudas de precios, ubicación, por qué piden los datos, etc.).
2. Si el cliente hizo una pregunta o tiene una duda, RESPÓNDELA primero de forma muy breve (1-2 frases), amable y natural.
3. Después de responder (o directamente si el cliente no preguntó nada nuevo), solicita el PRIMER dato que aparezca como 'FALTA' en la lista anterior de manera natural, cercana y conversacional.
4. Pide solo UN dato a la vez. No acumules preguntas ni solicites varios datos en el mismo mensaje.
5. Nunca inventes información. Habla de forma natural y directa por WhatsApp.`;
  }

  // 5. RESPUESTA DE GROQ (libre o guiada por recopilación)
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT + systemPromptAdicional },
      ...history.map(h => ({
        role:    h.role === 'USER' ? 'user' : 'assistant',
        content: h.content,
      })),
      { role: 'user', content: userMessage },
    ],
    temperature: 0.4,
    max_tokens:  300,
  });

  return completion.choices[0].message.content.trim();
};

module.exports = { generateGroqResponse };