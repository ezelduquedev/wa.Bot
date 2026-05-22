// pages/contacts.js

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        setContacts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error cargando contactos:', err);
        setError('No se pudieron cargar los contactos.');
        setLoading(false);
      });
  }, []);

  return (
    <Layout>
      <div className="content-wrapper" style={{ maxWidth: 1000 }}>
        <h1 style={{ marginBottom: 20 }}>Contactos</h1>

        <div className="card">
          <table className="data-table">
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Conversaciones</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={3}
                    style={{
                      textAlign: 'center',
                      padding: 32,
                      color: '#888'
                    }}
                  >
                    Cargando contactos...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td
                    colSpan={3}
                    style={{
                      textAlign: 'center',
                      padding: 32,
                      color: '#e74c3c'
                    }}
                  >
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && contacts.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    style={{
                      textAlign: 'center',
                      padding: 32,
                      color: '#888'
                    }}
                  >
                    No hay contactos registrados.
                  </td>
                </tr>
              )}

              {!loading && !error && contacts.map((c, i) => (
                <tr key={c.id ?? i}>
                  <td style={{ fontWeight: 600 }}>
                    {c.name || c.phone || 'Desconocido'}
                  </td>

                  <td style={{ fontFamily: 'monospace' }}>
                    {c.phone}
                  </td>

                  <td style={{ textAlign: 'center' }}>
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