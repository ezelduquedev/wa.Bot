import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

function Avatar({ name }) {
  const initials = name && name !== 'Desconocido'
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??';
  return (
    <div style={{
      width: 42, height: 42, borderRadius: 12,
      background: '#dcfce7', color: '#166534',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 14, fontWeight: 700,
    }}>
      {initials}
    </div>
  );
}

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [lastUpdate, setLastUpdate] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selected) fetchMessages(selected.id);
  }, [selected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchConversations() {
    const now = new Date();
    setLastUpdate(now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
    try {
      const res = await fetch(`${BACKEND_URL}/api/conversations`);
      if (res.ok) {
        const data = await res.json();
        setConversations(Array.isArray(data) ? data : (data.conversations || []));
      }
    } catch {}
  }

  async function fetchMessages(id) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/conversations/${id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : (data.messages || []));
      }
    } catch {}
  }

  const filtered = conversations.filter(c => {
    if (filter === 'open' && c.status !== 'open') return false;
    if (filter === 'closed' && c.status !== 'closed') return false;
    if (search && !((c.contact?.name || 'Desconocido').toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  return (
    <Layout>
      <div style={{ display: 'flex', height: 'calc(100vh - 0px)', overflow: 'hidden' }}>
        {/* Panel Izquierdo: Lista */}
        <div style={{ width: 380, borderRight: '1px solid #e5e7eb', background: '#fff', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px 20px', borderBottom: '1px solid #f3f4f6' }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Conversaciones</h1>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar contactos..."
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 8,
                border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 14,
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              {['all', 'open', 'closed'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                  background: filter === f ? '#111827' : '#f3f4f6', color: filter === f ? '#fff' : '#6b7280'
                }}>
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.map(conv => (
              <div key={conv.id} onClick={() => setSelected(conv)} style={{
                padding: '16px 20px', cursor: 'pointer', borderBottom: '1px solid #f9fafb',
                background: selected?.id === conv.id ? '#f0fdf4' : 'transparent',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar name={conv.contact?.name} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{conv.contact?.name || 'Desconocido'}</div>
                    <div style={{ fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.lastMessage || 'Sin mensajes'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel Derecho: Chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
          {selected ? (
            <>
              <div style={{ padding: '16px 24px', background: '#fff', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>
                {selected.contact?.name || 'Chat'}
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.direction === 'outbound' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '70%', padding: '12px 16px', borderRadius: '18px', fontSize: 14,
                      background: msg.direction === 'outbound' ? '#16a34a' : '#fff',
                      color: msg.direction === 'outbound' ? '#fff' : '#111827',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}>
                      {msg.content || msg.body}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 14 }}>
              Selecciona un chat para comenzar
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}