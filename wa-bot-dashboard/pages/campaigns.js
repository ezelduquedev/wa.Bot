import { useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export default function Campaigns() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSend = async () => {
    if (!message.trim()) return alert('El mensaje no puede estar vacío');
    const recipientList = recipients.split('\n').map(r => r.trim()).filter(Boolean);
    if (recipientList.length === 0) return alert('Añade al menos un destinatario');

    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/campaigns`, {
        name: name || 'Campaña sin nombre',
        message,
        recipients: recipientList,
      });
      setResult(res.data);
    } catch (e) {
      setResult({ error: e.response?.data?.error || 'Error al enviar la campaña' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Campañas</h1>
            <p className="page-sub">Envío masivo de mensajes vía WhatsApp Cloud API</p>
          </div>
          <div className="avatar-btn">N</div>
        </div>

        <div className="sandbox-banner">
          ⚠️ <strong>Sandbox activo:</strong> se envía el template <code>hello_world</code> (único disponible sin cuenta Business). El mensaje que escribas se guarda en el dashboard pero WhatsApp entregará el template de bienvenida.
        </div>

        <div className="two-col">
          <div className="form-panel">
            <h2 className="panel-title">Nueva campaña</h2>

            <div className="field">
              <label className="label">Nombre de la campaña <span className="optional">(opcional)</span></label>
              <input
                className="input"
                placeholder="Ej: Promoción mayo 2026"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="field">
              <label className="label">Mensaje <span className="char-count">{message.length}/1000</span></label>
              <textarea
                className="textarea"
                placeholder="Escribe el mensaje que recibirán todos los destinatarios..."
                value={message}
                onChange={e => e.target.value.length <= 1000 && setMessage(e.target.value)}
                rows={5}
              />
            </div>

            <div className="field">
              <label className="label">Destinatarios <span className="optional">{recipients.split('\n').filter(r => r.trim()).length} números</span></label>
              <textarea
                className="textarea"
                placeholder={'Un número por línea (con prefijo país):\n34612345678\n34699999999'}
                value={recipients}
                onChange={e => setRecipients(e.target.value)}
                rows={4}
              />
            </div>

            <button className="send-btn" onClick={handleSend} disabled={loading}>
              {loading ? (
                <span className="loading-text">
                  <span className="spinner"></span> Enviando...
                </span>
              ) : '📤 Enviar campaña'}
            </button>
          </div>

          <div className="result-panel">
            <h2 className="panel-title">Resultado</h2>
            {!result && !loading && (
              <div className="empty-result">
                <span className="empty-icon">📢</span>
                <p>Los resultados del envío aparecerán aquí.</p>
              </div>
            )}
            {loading && (
              <div className="empty-result">
                <span className="empty-icon">⏳</span>
                <p>Enviando mensajes...</p>
              </div>
            )}
            {result && !result.error && (
              <div className="result-content">
                <div className="result-stats">
                  <div className="result-stat ok">
                    <span className="rs-value">{result.sent || 0}</span>
                    <span className="rs-label">Enviados</span>
                  </div>
                  <div className="result-stat err">
                    <span className="rs-value">{result.errors || 0}</span>
                    <span className="rs-label">Errores</span>
                  </div>
                  <div className="result-stat total">
                    <span className="rs-value">{result.total || 0}</span>
                    <span className="rs-label">Total</span>
                  </div>
                </div>
                {result.results && result.results.map((r, i) => (
                  <div key={i} className={`result-row ${r.success ? 'ok' : 'err'}`}>
                    <span>{r.success ? '✅' : '❌'}</span>
                    <span className="result-phone">{r.phone}</span>
                    <span className="result-msg">{r.success ? 'Enviado' : r.error}</span>
                  </div>
                ))}
              </div>
            )}
            {result?.error && (
              <div className="error-banner">❌ {result.error}</div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .page { padding: 32px; }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        .page-title { font-size: 26px; font-weight: 700; color: #111827; margin: 0; }
        .page-sub { font-size: 13px; color: #9ca3af; margin: 4px 0 0; }
        .avatar-btn {
          width: 36px; height: 36px; border-radius: 50%;
          background: #111827; color: white;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 14px;
        }
        .sandbox-banner {
          background: #fffbeb;
          border: 1px solid #fcd34d;
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 13px;
          color: #92400e;
          margin-bottom: 24px;
        }
        .sandbox-banner code {
          background: #fef3c7;
          padding: 1px 4px;
          border-radius: 3px;
          font-family: monospace;
        }
        .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .form-panel, .result-panel {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          padding: 24px;
        }
        .panel-title { font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 20px; }
        .field { margin-bottom: 16px; }
        .label {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }
        .optional { font-weight: 400; color: #9ca3af; }
        .char-count { font-weight: 400; color: #9ca3af; }
        .input, .textarea {
          width: 100%;
          padding: 9px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
          font-family: inherit;
          resize: vertical;
        }
        .input:focus, .textarea:focus { border-color: #25D366; }
        .send-btn {
          width: 100%;
          padding: 12px;
          background: #25D366;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
          margin-top: 4px;
        }
        .send-btn:hover { background: #128C7E; }
        .send-btn:disabled { background: #9ca3af; cursor: not-allowed; }
        .loading-text { display: flex; align-items: center; justify-content: center; gap: 8px; }
        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .empty-result {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: #9ca3af;
          text-align: center;
        }
        .empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.5; }
        .empty-result p { font-size: 13px; margin: 0; }
        .result-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
        }
        .result-stat {
          flex: 1;
          text-align: center;
          padding: 12px;
          border-radius: 8px;
          background: #f9fafb;
        }
        .rs-value { display: block; font-size: 24px; font-weight: 700; }
        .rs-label { font-size: 11px; color: #9ca3af; font-weight: 600; }
        .result-stat.ok .rs-value { color: #16a34a; }
        .result-stat.err .rs-value { color: #dc2626; }
        .result-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
          font-size: 13px;
        }
        .result-phone { font-weight: 600; color: #374151; }
        .result-msg { color: #6b7280; margin-left: auto; }
        .error-banner {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 12px 16px;
          color: #dc2626;
          font-size: 13px;
        }
      `}</style>
    </Layout>
  );
}