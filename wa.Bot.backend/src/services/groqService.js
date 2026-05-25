// services/groqService.js

const Groq = require('groq-sdk');

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
- Nunca hagas demasiadas preguntas a la vez.
- Si el usuario ya mostró interés en un servicio, profundiza en ese servicio.
- Si el usuario pide información y muestra interés, guía la conversación hacia una llamada.
- Si el usuario acepta una llamada, NO vuelvas a preguntar qué necesita.
- Si el usuario acepta una llamada, pide directamente:
  - nombre
  - email
  - disponibilidad horaria
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

Nunca uses listas con guiones.
Habla como una conversación real de WhatsApp.
`;

const detectConversationState = (history, userMessage) => {
  const fullText = `
    ${history.map(h => h.content).join(' ')}
    ${userMessage}
  `.toLowerCase();

  const state = {
    interestedService: null,
    appointmentAccepted: false,
  };

  // detectar servicio
  if (
    fullText.includes('app') ||
    fullText.includes('ios') ||
    fullText.includes('android')
  ) {
    state.interestedService = 'apps';
  }

  else if (
    fullText.includes('web') ||
    fullText.includes('pagina') ||
    fullText.includes('tienda online')
  ) {
    state.interestedService = 'web';
  }

  else if (
    fullText.includes('bot') ||
    fullText.includes('chatbot') ||
    fullText.includes('whatsapp')
  ) {
    state.interestedService = 'chatbots';
  }

  else if (
    fullText.includes('empresa') ||
    fullText.includes('api') ||
    fullText.includes('automatizacion') ||
    fullText.includes('automatización')
  ) {
    state.interestedService = 'business';
  }

  // detectar intención de agendar
  const positiveWords = [
    'si',
    'sí',
    'vale',
    'perfecto',
    'me interesa',
    'quiero',
    'agendar',
    'claro',
    'ok',
    'okay',
    'genial',
  ];

  state.appointmentAccepted = positiveWords.some(word =>
    userMessage.toLowerCase().includes(word)
  );

  return state;
};

const generateGroqResponse = async (history, userMessage) => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('[Groq] GROQ_API_KEY no configurada en .env');
  }

  const groq = new Groq({ apiKey });

  const conversationState = detectConversationState(
    history,
    userMessage
  );

  const formattedHistory = history.map(msg => ({
    role: msg.role === 'USER'
      ? 'user'
      : 'assistant',

    content: msg.content,
  }));

  const messages = [
    {
      role: 'system',
      content: SYSTEM_PROMPT,
    },

    {
      role: 'system',
      content: `
Estado actual de conversación:
${JSON.stringify(conversationState)}

Reglas importantes:
- No repitas preguntas ya respondidas.
- Si el usuario aceptó una llamada:
  pide directamente nombre, email y disponibilidad.
- No vuelvas a preguntar qué servicio necesita.
- Mantén una conversación natural.
`,
    },

    ...formattedHistory,

    {
      role: 'user',
      content: userMessage,
    },
  ];

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',

    messages,

    temperature: 0.4,

    max_tokens: 500,
  });

  const responseText =
    completion.choices[0]?.message?.content?.trim();

  if (!responseText) {
    throw new Error('[Groq] Respuesta vacía del modelo');
  }

  console.log(
    `[Groq] Respuesta generada (${responseText.length} chars)`
  );

  return responseText;
};

module.exports = {
  generateGroqResponse,
};