import { useState } from 'react';
import Layout from '../components/Layout';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export default function Campaigns() {
  const [name, setName]           = useState('');
  const [message, setMessage]     = useState('');
  const [recipients, setRecipients] = useState('');
  const [sending, setSending]     = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState(null);

  async function handleSend() {
    const list = recipients.split('\n').map(r => r.trim()).filter(Boolean);

    if (list.length === 0) {
      setError('Añade al menos un destinatario.');
      return;
    }

    setSending(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/campaigns`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, message, recipients: list }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al enviar la campaña.');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setSending(false);
    }
  }

  return (
    <Layout>
      <div className="content-wrapper" style={{ maxWidth: 800 }}>
        <h1 style={{ marginBottom: 8 }}>Campañas</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>
          Envía mensajes masivos de forma segura.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
          ⚠️ En modo sandbox se usa la plantilla <strong>hello_world</strong>. 
          Con una cuenta Business verificada puedes usar plantillas personalizadas.
        </p>

        <div className="card" style={{ padding: 24 }}>

          <div className="form-group">
            <label className="form-label">Nombre de la campaña</label>
            <input
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Promo Mayo"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mensaje de referencia</label>
            <textarea
              className="form-input"
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Este texto se guarda en el historial como referencia de la campaña."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Destinatarios (uno por línea)</label>
            <textarea
              className="form-input"
              rows={4}
              value={recipients}
              onChange={e => setRecipients(e.target.value)}
              placeholder={"34685511414\n34612345678"}
            />
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
              {error}
            </div>
          )}

          {result && (
            <div style={{ background: '#dcfce7', color: '#166534', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
              ✅ Campaña <strong>{result.campaign}</strong> finalizada — 
              {result.sent} enviados, {result.errors} errores de {result.total} destinatarios.
            </div>
          )}

          <button
            className="action-btn"
            style={{ background: 'var(--green-dark)', color: '#fff', width: '100%', justifyContent: 'center' }}
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? 'Enviando...' : 'Enviar Campaña'}
          </button>

        </div>
      </div>
    </Layout>
  );
}