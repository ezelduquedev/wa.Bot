import { useState } from 'react';
import Layout from '../components/Layout';

export default function Campaigns() {
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState('');
  const [sending, setSending] = useState(false);

  return (
    <Layout>
      <div className="content-wrapper" style={{ maxWidth: 800 }}>
        <h1 style={{ marginBottom: 8 }}>Campañas</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Envía mensajes masivos de forma segura.</p>

        <div className="card" style={{ padding: 24 }}>
          <div className="form-group">
            <label className="form-label">Mensaje</label>
            <textarea className="form-input" rows={5} value={message} onChange={e => setMessage(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Destinatarios</label>
            <textarea className="form-input" rows={4} value={recipients} onChange={e => setRecipients(e.target.value)} placeholder="+34..." />
          </div>

          <button className="action-btn" style={{ background: 'var(--green-dark)', color: '#fff', width: '100%', justifyContent: 'center' }} onClick={() => {}}>
            {sending ? 'Enviando...' : 'Enviar Campaña'}
          </button>
        </div>
      </div>
    </Layout>
  );
}