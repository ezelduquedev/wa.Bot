// services/responseService.js
//
// Día 4: lógica de respuesta estática (menú de bienvenida).
// Día 5: este módulo se ampliará con Gemini para respuestas inteligentes.

/**
 * Genera una respuesta automática basada en el mensaje del usuario.
 * Por ahora implementa un menú estático. En Día 5 se sustituye por Gemini.
 *
 * @param {string} userMessage - Texto recibido del usuario
 * @returns {string} - Respuesta a enviar
 */
const buildStaticResponse = (userMessage) => {
  const text = userMessage.trim().toLowerCase();

  // Respuesta a opciones del menú
  if (text === '1') return '🕐 Nuestro horario es de lunes a viernes, de 9:00 a 18:00 h.';
  if (text === '2') return '📍 Nos encontramos en Calle Ejemplo 42, Vigo. ¡Te esperamos!';
  if (text === '3') return '📞 Puedes llamarnos al 685 51 14 14 o escribirnos aquí mismo.';
  if (text === '4') return '🌐 Visita nuestra web en https://wa.bot para más información.';

  // Saludos comunes → menú de bienvenida
  const greetings = ['hola', 'buenas', 'hi', 'hello', 'ola', 'buenos días', 'buenos dias', 'buenas tardes', 'buenas noches'];
  if (greetings.some(g => text.includes(g))) {
    return buildWelcomeMenu();
  }

  // Cualquier otro mensaje → menú de bienvenida igualmente
  return buildWelcomeMenu();
};

/**
 * Devuelve el menú de bienvenida formateado para WhatsApp.
 * @returns {string}
 */
const buildWelcomeMenu = () => {
  return (
    '👋 ¡Hola! Soy el asistente de WA.Bot.\n\n' +
    'Selecciona una opción escribiendo el número:\n\n' +
    '1️⃣  Horarios\n' +
    '2️⃣  Ubicación\n' +
    '3️⃣  Contacto\n' +
    '4️⃣  Web\n\n' +
    '_(Responde con el número de tu elección)_'
  );
};

module.exports = { buildStaticResponse };
