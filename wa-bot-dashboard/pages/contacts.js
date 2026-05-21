import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchContacts(); }, []);

  async function fetchContacts() {
    try {
      const res = await fetch(`${BACKEND_URL}/api/contacts`);
      if (res.ok) {
        const data = await res.json();
        setContacts(Array.isArray(data) ? data : (data.contacts || []));
      }
    } catch {}
  }

  const filtered = contacts.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  return (
    <Layout>
      <div style={{ padding: '28px 32px', maxWidth: 900 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Contactos</h1>

        <div style={{ marginBottom: 20 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o número..."
            style={{
              width: '100%', maxWidth: 400, padding: '9px 14px',
              border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14,
              outline: 'none', color: '#374151',
            }}
          />
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nombre</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Teléfono</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Conversaciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={3} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No hay contactos</td></tr>
              ) : (
                filtered.map((c, i) => (
                  <tr key={c.id || i} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: '#d1fae5', color: '#065f46',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700,
                        }}>
                          {(c.name || '?').slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{c.name || 'Desconocido'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#6b7280', fontFamily: 'monospace' }}>{c.phone || c.phoneNumber || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#6b7280' }}>{c._count?.conversations ?? c.conversationCount ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}