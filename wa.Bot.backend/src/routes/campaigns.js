// routes/campaigns.js

const express = require('express');
const router  = express.Router();
const { sendTemplateMessage } = require('../services/whatsappService');
const { findOrCreateContact, findOrCreateConversation, saveMessage } = require('../services/dbService');

/**
 * POST /api/campaigns
 * Body: { name: string, message: string, recipients: string[] }
 *
 * En sandbox usa el template hello_world (único disponible sin cuenta Business).
 * En producción con plantillas aprobadas, sustituir sendTemplateMessage por
 * sendWhatsAppMessage para enviar texto libre o plantillas personalizadas.
 */
router.post('/', async (req, res) => {
  const { name, message, recipients } = req.body;

  if (!Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: 'Debes incluir al menos un destinatario.' });
  }

  console.log(`[Campaign] Iniciando campaña "${name || 'Sin nombre'}" → ${recipients.length} destinatarios`);

  const results = [];

  for (const phone of recipients) {
    const number = phone.trim().replace(/\D/g, '');
    if (!number) {
      results.push({ phone, status: 'error', reason: 'Número inválido' });
      continue;
    }

    try {
      // Sandbox: enviamos el template hello_world
      const waMessageId = await sendTemplateMessage(number, 'hello_world', 'en_US');

      // Guardar en BD para que aparezca en el dashboard de conversaciones
      const contact      = await findOrCreateContact(number);
      const conversation = await findOrCreateConversation(contact.id);
      await saveMessage({
        conversationId: conversation.id,
        role:           'ASSISTANT',
        content:        message || '[Template: hello_world]',
        waMessageId:    waMessageId || null,
        timestamp:      new Date(),
      });

      console.log(`[Campaign] ✓ Enviado a ${number}`);
      results.push({ phone: number, status: 'sent', waMessageId });

    } catch (err) {
      const reason = err.response?.data?.error?.message || err.message || 'Error desconocido';
      console.error(`[Campaign] ✗ Error con ${number}:`, reason);
      results.push({ phone: number, status: 'error', reason });
    }
  }

  const sent   = results.filter((r) => r.status === 'sent').length;
  const errors = results.filter((r) => r.status === 'error').length;

  console.log(`[Campaign] Finalizada — ${sent} enviados, ${errors} errores`);

  res.json({
    campaign: name || 'Sin nombre',
    total:    recipients.length,
    sent,
    errors,
    results,
  });
});

module.exports = router;