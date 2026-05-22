// pages/contacts.js
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts`)
      .then(r => r.json())
      .then(data => {
        setContacts(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar contactos');
        setLoading(false);
      });
  }, []);

  return (
    <Layout>
      <div className="content-wrapper" style={{ maxWidth: 1000 }}>
        <h1 style={{ marginBottom: 20 }}>Contactos</h1>
        <div className="card">
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Nombre</th>
                <th style={{ padding: '12px' }}>Teléfono</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Conversaciones</th>
              </tr>
            </thead>
            <tbody>
              {!loading && contacts.map((c, i) => (
                <tr key={c.id ?? i} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: '12px', fontWeight: 600 }}>
                    {c.name && c.name !== 'Desconocido' ? c.name : 'Desconocido'}
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                    {c.phone || 'N/A'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {c.conversationCount ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}