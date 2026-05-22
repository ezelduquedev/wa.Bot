// services/groqService.js

const Groq = require('groq-sdk');

const SYSTEM_PROMPT = `Eres el asistente virtual de Ezel Dev, una agencia de desarrollo digital especializada en soluciones tecnológicas para empresas.

Ayudas a clientes a entender los servicios disponibles, resolver dudas y agendar una primera consulta. Respondes siempre en el idioma del cliente.

Servicios que ofrecemos:
- Desarrollo web: landing pages, webs corporativas y tiendas online a medida.
- Desarrollo de apps: aplicaciones móviles (iOS y Android) y aplicaciones web progresivas (PWA).
- Chatbots y automatización: bots de WhatsApp, atención al cliente automatizada e integración con CRM.
- Soluciones para empresas: consultoría tecnológica, integración de APIs y digitalización de procesos.

Información de contacto:
- Horario: lunes a viernes, de 9:00 a 18:00 h.
- Ubicación: Calle Mirabel, 12, Valladolid.
- Teléfono: 685 51 14 14
- Web: https://wa-bot-iota.vercel.app/

Directrices de respuesta:
- Sé conciso y directo: máximo 3-4 frases por respuesta.
- Escribe de forma conversacional, como lo haría una persona real por WhatsApp.
- Si el cliente muestra interés en un servicio concreto, invítale a agendar una llamada o escribir al teléfono.
- Usa emojis con moderación y solo cuando aporten calidez.
- Texto plano con saltos de línea si es necesario. Nunca uses markdown ni guiones.
- Nunca inventes precios ni plazos. Si preguntan por presupuesto, indica que depende del proyecto y que pueden contactar para una consulta gratuita.
- Si no puedes responder algo, indica que un agente se pondrá en contacto.`;

const generateGroqResponse = async (history, userMessage) => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('[Groq] GROQ_API_KEY no configurada en .env');
  }

  const groq = new Groq({ apiKey });

  const formattedHistory = history.map(msg => ({
    role:    msg.role === 'USER' ? 'user' : 'assistant',
    content: msg.content,
  }));

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...formattedHistory,
    { role: 'user',   content: userMessage },
  ];

  const completion = await groq.chat.completions.create({
    model:       'llama-3.3-70b-versatile',
    messages,
    max_tokens:  300,
    temperature: 0.6,
  });

  const responseText = completion.choices[0]?.message?.content?.trim();

  if (!responseText) {
    throw new Error('[Groq] Respuesta vacía del modelo');
  }

  console.log(`[Groq] Respuesta generada (${responseText.length} chars)`);
  return responseText;
};

module.exports = { generateGroqResponse };