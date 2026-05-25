// services/emailService.js
// Sin dependencias npm — usa fetch nativo de Node 18+

const buildEmailHTML = ({ name, date, time, email }) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Cita confirmada · Ezel Dev</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Georgia',serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;">

          <!-- ── HEADER ── -->
          <tr>
            <td style="
              background:linear-gradient(135deg,#0f0f1a 0%,#1a1a2e 100%);
              border-radius:16px 16px 0 0;
              padding:40px 48px 36px;
              border-bottom:1px solid #ffffff0f;
              position:relative;
            ">
              <div style="
                position:absolute;top:0;left:48px;right:48px;height:2px;
                background:linear-gradient(90deg,#6366f1,#a855f7,#ec4899);
                border-radius:0 0 4px 4px;
              "></div>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0;font-family:'Georgia',serif;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                      Ezel<span style="color:#a855f7;">Dev</span>
                    </p>
                    <p style="margin:4px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#6b7280;letter-spacing:2px;text-transform:uppercase;">
                      Soluciones digitales
                    </p>
                  </td>
                  <td align="right">
                    <span style="
                      display:inline-block;
                      background:linear-gradient(135deg,#6366f1,#a855f7);
                      color:#ffffff;
                      font-family:'Helvetica Neue',Arial,sans-serif;
                      font-size:11px;
                      font-weight:600;
                      letter-spacing:1.5px;
                      text-transform:uppercase;
                      padding:6px 14px;
                      border-radius:20px;
                    ">✓ Confirmada</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── HERO ── -->
          <tr>
            <td style="
              background:#0f0f1a;
              padding:48px 48px 40px;
              border-left:1px solid #ffffff08;
              border-right:1px solid #ffffff08;
            ">
              <p style="
                margin:0 0 8px;
                font-family:'Georgia',serif;
                font-size:32px;
                font-weight:700;
                color:#ffffff;
                line-height:1.2;
                letter-spacing:-1px;
              ">Tu cita está<br/>
                <span style="
                  background:linear-gradient(90deg,#a855f7,#ec4899);
                  -webkit-background-clip:text;
                  -webkit-text-fill-color:transparent;
                ">lista.</span>
              </p>
              <p style="
                margin:20px 0 0;
                font-family:'Helvetica Neue',Arial,sans-serif;
                font-size:15px;
                color:#9ca3af;
                line-height:1.7;
              ">
                Hola <strong style="color:#e5e7eb;">${name}</strong>, hemos registrado
                tu solicitud correctamente. Un especialista se pondrá en contacto contigo
                en el horario indicado.
              </p>
            </td>
          </tr>

          <!-- ── DETALLES ── -->
          <tr>
            <td style="
              background:#0f0f1a;
              padding:0 48px 48px;
              border-left:1px solid #ffffff08;
              border-right:1px solid #ffffff08;
            ">
              <table width="100%" cellpadding="0" cellspacing="0" style="
                background:#1a1a2e;
                border-radius:12px;
                border:1px solid #ffffff10;
                overflow:hidden;
              ">
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #ffffff08;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;color:#6366f1;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Contacto</p>
                          <p style="margin:6px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;color:#f3f4f6;font-weight:500;">${name}</p>
                        </td>
                        <td align="right" style="font-size:20px;">👤</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #ffffff08;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;color:#a855f7;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Fecha</p>
                          <p style="margin:6px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;color:#f3f4f6;font-weight:500;text-transform:capitalize;">${date}</p>
                        </td>
                        <td align="right" style="font-size:20px;">📅</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #ffffff08;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;color:#ec4899;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Hora</p>
                          <p style="margin:6px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;color:#f3f4f6;font-weight:500;">${time}:00 h</p>
                        </td>
                        <td align="right" style="font-size:20px;">⏰</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Email</p>
                          <p style="margin:6px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;color:#f3f4f6;font-weight:500;">${email}</p>
                        </td>
                        <td align="right" style="font-size:20px;">✉️</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td style="
                    background:#1a1a2e;
                    border-left:3px solid #a855f7;
                    border-radius:0 8px 8px 0;
                    padding:14px 18px;
                  ">
                    <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#9ca3af;line-height:1.6;">
                      Si necesitas cambiar la cita, escríbenos directamente
                      por <strong style="color:#e5e7eb;">WhatsApp</strong> al
                      <strong style="color:#e5e7eb;">685 51 14 14</strong>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="
              background:#070710;
              border-radius:0 0 16px 16px;
              padding:24px 48px;
              border-top:1px solid #ffffff08;
            ">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#4b5563;">
                      Ezel Dev · Calle Mirabel 12, Valladolid
                    </p>
                    <p style="margin:4px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#4b5563;">
                      685 51 14 14 · wa-bot-iota.vercel.app
                    </p>
                  </td>
                  <td align="right">
                    <p style="margin:0;font-family:'Georgia',serif;font-size:14px;color:#374151;font-style:italic;">
                      Ezel<span style="color:#6366f1;">Dev</span>
                    </p>
                  </td>
                </tr>
              </table>
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
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Ezel Dev', email: 'zenderdk@gmail.com' },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[Brevo] Error ${res.status}: ${err}`);
  }

  return res.json();
};

const sendAppointmentEmails = async ({ name, date, time, email }) => {
  const html = buildEmailHTML({ name, date, time, email });

  try {
    await Promise.all([
      // Email de confirmación al cliente
      sendEmail({
        to:      email,
        subject: `✅ Cita confirmada — ${date} a las ${time}h · Ezel Dev`,
        html,
      }),
      // Notificación interna
      sendEmail({
        to:      'zenderdk@gmail.com',
        subject: `📅 Nueva cita — ${name} · ${date} a las ${time}h`,
        html: `
          <body style="background:#0a0a0f;padding:32px;font-family:'Helvetica Neue',Arial,sans-serif;">
            <div style="max-width:480px;margin:0 auto;background:#1a1a2e;border-radius:12px;padding:32px;border:1px solid #ffffff10;">
              <p style="margin:0 0 4px;font-size:18px;font-weight:700;color:#ffffff;">
                📅 Nueva cita registrada
              </p>
              <p style="margin:0 0 24px;font-size:13px;color:#6b7280;">Desde el chatbot de WhatsApp</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:10px 0;border-bottom:1px solid #ffffff08;">
                  <span style="font-size:12px;color:#a855f7;text-transform:uppercase;letter-spacing:1px;">Nombre</span><br/>
                  <span style="font-size:15px;color:#f3f4f6;">${name}</span>
                </td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #ffffff08;">
                  <span style="font-size:12px;color:#a855f7;text-transform:uppercase;letter-spacing:1px;">Email cliente</span><br/>
                  <span style="font-size:15px;color:#f3f4f6;">${email}</span>
                </td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #ffffff08;">
                  <span style="font-size:12px;color:#a855f7;text-transform:uppercase;letter-spacing:1px;">Fecha</span><br/>
                  <span style="font-size:15px;color:#f3f4f6;text-transform:capitalize;">${date}</span>
                </td></tr>
                <tr><td style="padding:10px 0;">
                  <span style="font-size:12px;color:#a855f7;text-transform:uppercase;letter-spacing:1px;">Hora</span><br/>
                  <span style="font-size:15px;color:#f3f4f6;">${time}h</span>
                </td></tr>
              </table>
            </div>
          </body>
        `,
      }),
    ]);

    console.log(`[Email] ✅ Emails enviados — cliente: ${email}`);
  } catch (err) {
    console.error('[Email] Error al enviar:', err.message);
  }
};

module.exports = { sendAppointmentEmails };