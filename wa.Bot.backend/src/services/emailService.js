// services/emailService.js
// Sin dependencias npm — usa fetch nativo de Node 18+

const buildEmailHTML = ({ name, date, time, email }) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#111827;padding:32px 40px;">
              <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Ezel Dev</p>
              <p style="margin:6px 0 0;color:#9ca3af;font-size:13px;">Soluciones digitales para empresas</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;color:#111827;font-size:20px;font-weight:600;">¡Cita confirmada! 🙌</p>
              <p style="margin:0 0 32px;color:#6b7280;font-size:15px;line-height:1.6;">
                Hola <strong>${name}</strong>, hemos registrado tu solicitud. Aquí tienes el resumen:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
                    <p style="margin:0;color:#6b7280;font-size:12px;text-transform:uppercase;">Persona de contacto</p>
                    <p style="margin:4px 0 0;color:#111827;font-size:15px;font-weight:500;">${name}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
                    <p style="margin:0;color:#6b7280;font-size:12px;text-transform:uppercase;">Fecha</p>
                    <p style="margin:4px 0 0;color:#111827;font-size:15px;font-weight:500;text-transform:capitalize;">${date}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
                    <p style="margin:0;color:#6b7280;font-size:12px;text-transform:uppercase;">Hora</p>
                    <p style="margin:4px 0 0;color:#111827;font-size:15px;font-weight:500;">${time}h</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;color:#6b7280;font-size:12px;text-transform:uppercase;">Email</p>
                    <p style="margin:4px 0 0;color:#111827;font-size:15px;font-weight:500;">${email}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:32px 0 0;color:#6b7280;font-size:14px;line-height:1.6;">
                Nuestro equipo se pondrá en contacto contigo en la fecha y hora indicadas.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                Ezel Dev · Calle Mirabel 12, Valladolid · 685 51 14 14
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const sendEmail = async ({ to, subject, html }) => {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Ezel Dev <onboarding@resend.dev>',
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[Resend] Error ${res.status}: ${err}`);
  }

  return res.json();
};

const sendAppointmentEmails = async ({ name, date, time, email }) => {
  const html = buildEmailHTML({ name, date, time, email });

  try {
    await Promise.all([
      // Email al cliente
      sendEmail({
        to:      email,
        subject: `✅ Cita confirmada — ${date} a las ${time}h`,
        html,
      }),
      // Notificación interna
      sendEmail({
        to:      process.env.EMAIL_INTERNAL,
        subject: `📅 Nueva cita — ${name} el ${date} a las ${time}h`,
        html: `
          <p><strong>Nueva cita registrada desde el chatbot de WhatsApp</strong></p>
          <ul>
            <li><strong>Nombre:</strong> ${name}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Fecha:</strong> ${date}</li>
            <li><strong>Hora:</strong> ${time}h</li>
          </ul>
        `,
      }),
    ]);

    console.log(`[Email] Confirmación enviada a ${email}`);
  } catch (err) {
    console.error('[Email] Error al enviar:', err.message);
  }
};

module.exports = { sendAppointmentEmails };