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
<body style="margin:0;padding:0;background:#05050f;font-family:'Helvetica Neue',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#05050f;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- TOP ACCENT BAR -->
        <tr><td style="height:4px;background:linear-gradient(90deg,#6366f1 0%,#a855f7 50%,#ec4899 100%);border-radius:4px 4px 0 0;"></td></tr>

        <!-- HEADER -->
        <tr><td style="background:#0d0d1f;padding:36px 48px 28px;border-left:1px solid #ffffff0a;border-right:1px solid #ffffff0a;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td>
              <span style="font-family:Georgia,serif;font-size:24px;font-weight:700;color:#fff;letter-spacing:-0.5px;">
                Ezel<span style="color:#a855f7;">Dev</span>
              </span>
              <br/>
              <span style="font-size:11px;color:#4b5563;letter-spacing:3px;text-transform:uppercase;">Soluciones digitales</span>
            </td>
            <td align="right">
              <span style="background:#6366f110;border:1px solid #6366f130;color:#a5b4fc;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;padding:7px 16px;border-radius:100px;">
                ✓ &nbsp;Confirmada
              </span>
            </td>
          </tr></table>
        </td></tr>

        <!-- DIVIDER -->
        <tr><td style="height:1px;background:linear-gradient(90deg,transparent,#6366f120,#a855f730,#6366f120,transparent);border-left:1px solid #ffffff0a;border-right:1px solid #ffffff0a;"></td></tr>

        <!-- HERO -->
        <tr><td style="background:#0d0d1f;padding:48px 48px 16px;border-left:1px solid #ffffff0a;border-right:1px solid #ffffff0a;">
          <p style="margin:0;font-family:Georgia,serif;font-size:38px;font-weight:700;color:#fff;line-height:1.15;letter-spacing:-1.5px;">
            Tu cita<br/>está lista<span style="color:#a855f7;">.</span>
          </p>
          <p style="margin:20px 0 0;font-size:15px;color:#6b7280;line-height:1.75;">
            Hola <strong style="color:#e5e7eb;font-weight:500;">${name}</strong> — hemos registrado tu solicitud. Un especialista te contactará en el horario confirmado.
          </p>
        </td></tr>

        <!-- DETAILS CARD -->
        <tr><td style="background:#0d0d1f;padding:32px 48px 48px;border-left:1px solid #ffffff0a;border-right:1px solid #ffffff0a;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ffffff0d;border-radius:16px;overflow:hidden;background:#111127;">

            <!-- Row: Nombre -->
            <tr><td style="padding:22px 28px;border-bottom:1px solid #ffffff08;">
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td>
                  <p style="margin:0;font-size:10px;color:#6366f1;letter-spacing:3px;text-transform:uppercase;font-weight:700;">Nombre</p>
                  <p style="margin:8px 0 0;font-size:17px;color:#f9fafb;font-weight:500;">${name}</p>
                </td>
                <td align="right" style="width:44px;">
                  <div style="width:40px;height:40px;background:#6366f112;border:1px solid #6366f120;border-radius:12px;text-align:center;line-height:40px;font-size:18px;">👤</div>
                </td>
              </tr></table>
            </td></tr>

            <!-- Row: Fecha -->
            <tr><td style="padding:22px 28px;border-bottom:1px solid #ffffff08;">
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td>
                  <p style="margin:0;font-size:10px;color:#a855f7;letter-spacing:3px;text-transform:uppercase;font-weight:700;">Fecha</p>
                  <p style="margin:8px 0 0;font-size:17px;color:#f9fafb;font-weight:500;text-transform:capitalize;">${date}</p>
                </td>
                <td align="right" style="width:44px;">
                  <div style="width:40px;height:40px;background:#a855f712;border:1px solid #a855f720;border-radius:12px;text-align:center;line-height:40px;font-size:18px;">📅</div>
                </td>
              </tr></table>
            </td></tr>

            <!-- Row: Hora -->
            <tr><td style="padding:22px 28px;border-bottom:1px solid #ffffff08;">
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td>
                  <p style="margin:0;font-size:10px;color:#ec4899;letter-spacing:3px;text-transform:uppercase;font-weight:700;">Hora</p>
                  <p style="margin:8px 0 0;font-size:17px;color:#f9fafb;font-weight:500;">${time} h</p>
                </td>
                <td align="right" style="width:44px;">
                  <div style="width:40px;height:40px;background:#ec489912;border:1px solid #ec489920;border-radius:12px;text-align:center;line-height:40px;font-size:18px;">⏰</div>
                </td>
              </tr></table>
            </td></tr>

            <!-- Row: Email -->
            <tr><td style="padding:22px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td>
                  <p style="margin:0;font-size:10px;color:#10b981;letter-spacing:3px;text-transform:uppercase;font-weight:700;">Email</p>
                  <p style="margin:8px 0 0;font-size:17px;color:#f9fafb;font-weight:500;">${email}</p>
                </td>
                <td align="right" style="width:44px;">
                  <div style="width:40px;height:40px;background:#10b98112;border:1px solid #10b98120;border-radius:12px;text-align:center;line-height:40px;font-size:18px;">✉️</div>
                </td>
              </tr></table>
            </td></tr>

          </table>

          <!-- NOTE -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
            <tr><td style="padding:16px 20px;background:#111127;border:1px solid #ffffff08;border-radius:12px;">
              <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.7;">
                ¿Necesitas cambiar la cita? Escríbenos por
                <strong style="color:#a5b4fc;">WhatsApp al 685 51 14 14</strong>
                y te ayudamos de inmediato.
              </p>
            </td></tr>
          </table>
        </td></tr>

        <!-- BOTTOM ACCENT -->
        <tr><td style="height:1px;background:linear-gradient(90deg,transparent,#6366f120,#a855f730,#6366f120,transparent);border-left:1px solid #ffffff0a;border-right:1px solid #ffffff0a;"></td></tr>

        <!-- FOOTER -->
        <tr><td style="background:#080814;padding:24px 48px;border-radius:0 0 4px 4px;border:1px solid #ffffff0a;border-top:none;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td>
              <p style="margin:0;font-size:12px;color:#374151;">Ezel Dev · Calle Mirabel 12, Valladolid</p>
              <p style="margin:4px 0 0;font-size:12px;color:#374151;">685 51 14 14 · wa-bot-iota.vercel.app</p>
            </td>
            <td align="right">
              <span style="font-family:Georgia,serif;font-size:15px;color:#1f2937;font-style:italic;">
                Ezel<span style="color:#4f46e5;">Dev</span>
              </span>
            </td>
          </tr></table>
        </td></tr>

        <!-- BOTTOM BAR -->
        <tr><td style="height:4px;background:linear-gradient(90deg,#6366f1 0%,#a855f7 50%,#ec4899 100%);border-radius:0 0 4px 4px;"></td></tr>

      </table>
    </td></tr>
  </table>

</body>
</html>
`;

const buildInternalHTML = ({ name, email, date, time }) => `
<body style="background:#05050f;padding:32px;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:500px;margin:0 auto;">
    <div style="height:3px;background:linear-gradient(90deg,#6366f1,#a855f7,#ec4899);border-radius:3px 3px 0 0;"></div>
    <div style="background:#0d0d1f;border:1px solid #ffffff0a;border-top:none;border-radius:0 0 16px 16px;padding:32px;">
      <p style="margin:0 0 4px;font-size:20px;font-weight:700;color:#fff;">📅 Nueva cita registrada</p>
      <p style="margin:0 0 28px;font-size:13px;color:#4b5563;">Desde el chatbot de WhatsApp · ${new Date().toLocaleDateString('es-ES', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:14px 0;border-bottom:1px solid #ffffff08;">
          <span style="font-size:10px;color:#6366f1;letter-spacing:3px;text-transform:uppercase;font-weight:700;">Nombre</span><br/>
          <span style="font-size:16px;color:#f3f4f6;font-weight:500;margin-top:6px;display:block;">${name}</span>
        </td></tr>
        <tr><td style="padding:14px 0;border-bottom:1px solid #ffffff08;">
          <span style="font-size:10px;color:#a855f7;letter-spacing:3px;text-transform:uppercase;font-weight:700;">Email cliente</span><br/>
          <span style="font-size:16px;color:#f3f4f6;font-weight:500;margin-top:6px;display:block;">${email}</span>
        </td></tr>
        <tr><td style="padding:14px 0;border-bottom:1px solid #ffffff08;">
          <span style="font-size:10px;color:#ec4899;letter-spacing:3px;text-transform:uppercase;font-weight:700;">Fecha</span><br/>
          <span style="font-size:16px;color:#f3f4f6;font-weight:500;margin-top:6px;display:block;text-transform:capitalize;">${date}</span>
        </td></tr>
        <tr><td style="padding:14px 0;">
          <span style="font-size:10px;color:#10b981;letter-spacing:3px;text-transform:uppercase;font-weight:700;">Hora</span><br/>
          <span style="font-size:16px;color:#f3f4f6;font-weight:500;margin-top:6px;display:block;">${time} h</span>
        </td></tr>
      </table>
    </div>
  </div>
</body>
`;

const sendEmail = async ({ to, subject, html }) => {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Ezel Dev', email: 'ezzelprod@gmail.com' },
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
      sendEmail({
        to:      email,
        subject: `✅ Cita confirmada — ${date} a las ${time} · Ezel Dev`,
        html,
      }),
      sendEmail({
        to:      'ezzelprod@gmail.com',
        subject: `📅 Nueva cita — ${name} · ${date} a las ${time}`,
        html:    buildInternalHTML({ name, email, date, time }),
      }),
    ]);

    console.log(`[Email] ✅ Emails enviados — cliente: ${email}`);

  } catch (err) {
    console.error('[Email] ❌ Error al enviar:', err.message);
    console.error('[Email] ❌ Detalle:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
  }
};

module.exports = { sendAppointmentEmails };