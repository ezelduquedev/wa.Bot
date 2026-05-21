import { useState } from 'react';
import Layout from '../components/Layout';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
const MAX_CHARS = 1024;

export default function Campaigns() {
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  async function handleSend() {
    if (!message.trim() || !recipients.trim()) return;
    setSending(true);
    setResult(null);
    const phones = recipients.split('\n').map(p => p.trim()).filter(Boolean);
    try {
      const res = await fetch(`${BACKEND_URL}/api/campaigns/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, recipients: phones }),
      });
      const data = await res.json();
      setResult({ ok: res.ok, data });
    } catch (err) {
      setResult({ ok: false, data: { error: err.message } });
    } finally {
      setSending(false);
    }
  }

  return (
    <Layout>
      <div style={{ padding: '28px 32px', maxWidth: 800 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Campañas</h1>
        <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 28 }}>Envía mensajes masivos a múltiples contactos de WhatsApp.</p>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '24px' }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              Mensaje de la campaña
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value.slice(0, MAX_CHARS))}
              placeholder="Escribe tu mensaje aquí..."
              rows={5}
              style={{
                width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: 8,
                fontSize: 14, resize: 'vertical', outline: 'none', color: '#111827', fontFamily: 'inherit',
              }}
            />
            <div style={{ textAlign: 'right', fontSize: 12, color: message.length > MAX_CHARS * 0.9 ? '#ef4444' : '#9ca3af', marginTop: 4 }}>
              {message.length}/{MAX_CHARS}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              Destinatarios (un número por línea)
            </label>
            <textarea
              value={recipients}
              onChange={e => setRecipients(e.target.value)}
              placeholder="+34612345678&#10;+34698765432"
              rows={4}
              style={{
                width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: 8,
                fontSize: 14, resize: 'vertical', outline: 'none', color: '#111827', fontFamily: 'monospace',
              }}
            />
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
              {recipients.split('\n').filter(p => p.trim()).length} destinatario(s)
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={sending || !message.trim() || !recipients.trim()}
            style={{
              background: sending ? '#9ca3af' : '#25D366', color: '#fff',
              border: 'none', borderRadius: 8, padding: '12px 24px',
              fontSize: 14, fontWeight: 600, cursor: sending ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {sending ? 'Enviando...' : '📣 Enviar campaña'}
          </button>
        </div>

        {result && (
          <div style={{
            marginTop: 20, padding: '16px 20px', borderRadius: 12,
            background: result.ok ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${result.ok ? '#bbf7d0' : '#fecaca'}`,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: result.ok ? '#16a34a' : '#dc2626', marginBottom: 4 }}>
              {result.ok ? '✅ Campaña enviada' : '❌ Error al enviar'}
            </div>
            <pre style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Layout>
  );
}