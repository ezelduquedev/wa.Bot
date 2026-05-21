import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

function Avatar({ name }) {
  const initials = name && name !== 'Desconocido'
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??';
  return (
    <div style={{
      width: 40, height: 40, borderRadius: '50%',
      background: '#d1fae5', color: '#065f46',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 700, flexShrink: 0,
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
  const [stats, setStats] = useState({ total: 0, open: 0, closed: 0 });
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
        const list = Array.isArray(data) ? data : (data.conversations || []);
        setConversations(list);
        setStats({
          total: list.length,
          open: list.filter(c => c.status === 'open').length,
          closed: list.filter(c => c.status === 'closed').length,
        });
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

  function formatTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000) return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return 'Ayer';
  }

  return (
    <Layout>
      <div style={{ display: 'flex', height: '100%' }}>
        {/* Conversations list panel */}
        <div style={{
          width: 360, minWidth: 360, borderRight: '1px solid #e5e7eb',
          background: '#fff', display: 'flex', flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{ padding: '16px 16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Chats</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 16 }}>≡</button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 16 }}>✏</button>
              </div>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14 }}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar conversaciones..."
                style={{
                  width: '100%', padding: '9px 12px 9px 32px', borderRadius: 8,
                  border: '1px solid #e5e7eb', fontSize: 14, background: '#f9fafb',
                  outline: 'none', color: '#374151',
                }}
              />
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e5e7eb', marginBottom: 0 }}>
              {[
                { key: 'all', label: 'Todas' },
                { key: 'open', label: `Abiertas (${stats.open})` },
                { key: 'closed', label: 'Cerradas' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  style={{
                    padding: '8px 14px', fontSize: 13, fontWeight: 500,
                    border: 'none', background: 'none', cursor: 'pointer',
                    color: filter === tab.key ? '#16a34a' : '#6b7280',
                    borderBottom: filter === tab.key ? '2px solid #25D366' : '2px solid transparent',
                    marginBottom: -1,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                No hay conversaciones
              </div>
            ) : (
              filtered.map(conv => {
                const name = conv.contact?.name || 'Desconocido';
                const isSelected = selected?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelected(conv)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                      borderBottom: '1px solid #f3f4f6', cursor: 'pointer',
                      background: isSelected ? '#f0fdf4' : 'transparent',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f9fafb'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Avatar name={name} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{name}</span>
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>{formatTime(conv.updatedAt || conv.createdAt)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                        <span style={{ fontSize: 13, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {conv.lastMessage || 'Sin mensajes'}
                        </span>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, marginLeft: 8, flexShrink: 0,
                          color: conv.status === 'open' ? '#16a34a' : '#6b7280',
                          background: conv.status === 'open' ? '#f0fdf4' : '#f3f4f6',
                        }}>
                          {conv.status === 'open' ? '● Abierta' : 'Cerrada'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Stats bar */}
          <div style={{
            background: '#fff', borderBottom: '1px solid #e5e7eb',
            padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 28,
          }}>
            <StatBadge icon="💬" value={stats.total} label="TOTAL" />
            <StatBadge icon="💬" value={stats.open} label="ABIERTAS" color="#16a34a" />
            <StatBadge icon="🔲" value={stats.closed} label="CERRADAS" color="#6b7280" />
            <div style={{ marginLeft: 'auto', fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>🕐</span> Actualizado {lastUpdate}
            </div>
          </div>

          {/* Messages or empty state */}
          {selected ? (
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: 60 }}>Sin mensajes en esta conversación</div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.direction === 'outbound' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '60%', padding: '10px 14px', borderRadius: 12, fontSize: 14, lineHeight: 1.5,
                      background: msg.direction === 'outbound' ? '#dcfce7' : '#fff',
                      border: '1px solid',
                      borderColor: msg.direction === 'outbound' ? '#bbf7d0' : '#e5e7eb',
                      color: '#111827',
                    }}>
                      {msg.content || msg.body || msg.text}
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, textAlign: 'right' }}>
                        {formatTime(msg.createdAt || msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', color: '#9ca3af',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>💬</div>
              <div style={{ fontSize: 16, fontWeight: 500, color: '#6b7280' }}>Selecciona una conversación</div>
              <div style={{ fontSize: 14, marginTop: 6, maxWidth: 280, textAlign: 'center' }}>
                Haz clic en un chat de la lista para ver los mensajes y el historial completo.
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function StatBadge({ value, label, color = '#374151' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width="20" height="20" fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
      <span style={{ fontSize: 20, fontWeight: 700, color }}>{value}</span>
      <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{label}</span>
    </div>
  );
}