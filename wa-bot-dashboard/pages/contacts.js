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
        <h1>Contactos</h1>
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Conversaciones</th>
              </tr>
            </thead>
            <tbody>
              {!loading && contacts.map((c, i) => (
                <tr key={c.id ?? i}>
                  <td style={{ fontWeight: 600 }}>{c.name || 'Desconocido'}</td>
                  <td style={{ fontFamily: 'monospace' }}>{c.phone || 'Sin número'}</td>
                  <td style={{ textAlign: 'center' }}>{c.conversationCount ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}