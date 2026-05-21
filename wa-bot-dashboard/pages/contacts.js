import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);

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
              {contacts.map((c, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{c.name || 'Desconocido'}</td>
                  <td style={{ fontFamily: 'monospace' }}>{c.phone}</td>
                  <td>{c.conversationCount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}