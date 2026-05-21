import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import ConversationCard from '../components/ConversationCard';
import MessageBubble from '../components/MessageBubble';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

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

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/conversations`);
      setConversations(res.data || []);
      setLastUpdate(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      console.error('Error:', e);
    }
  };

  const fetchMessages = async (id) => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/conversations/${id}/messages`);
      setMessages(res.data || []);
    } catch (e) {
      console.error('Error:', e);
    }
  };

  const filtered = conversations.filter(c => {
    const matchFilter = filter === 'all' || (filter === 'open' && c.status === 'OPEN') || (filter === 'closed' && c.status === 'CLOSED');
    const matchSearch = c.phoneNumber?.includes(search) || c.phone_number?.includes(search);
    return matchFilter && matchSearch;
  });

  const openCount = conversations.filter(c => c.status === 'OPEN').length;
  const closedCount = conversations.filter(c => c.status === 'CLOSED').length;

  return (
    <Layout>
      <div className="page">
        <div className="chat-container">
          {/* Left panel */}
          <div className="left-panel">
            <div className="left-header">
              <h2 className="panel-title">Chats</h2>
              <div className="header-right">
                <span className="stat-pill">💬 {conversations.length} TOTAL</span>
                <span className="stat-pill open">🟢 {openCount} ABIERTAS</span>
                <span className="stat-pill closed">⬜ {closedCount} CERRADAS</span>
                {lastUpdate && <span className="update-time">⏱ Actualizado {lastUpdate}</span>}
              </div>
            </div>

            <div className="search-box">
              <input
                type="text"
                placeholder="Buscar conversaciones..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-tabs">
              {['all', 'open', 'closed'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`tab ${filter === f ? 'active' : ''}`}
                >
                  {f === 'all' ? `Todas (${conversations.length})` : f === 'open' ? `Abiertas (${openCount})` : `Cerradas (${closedCount})`}
                </button>
              ))}
            </div>

            <div className="conv-list">
              {filtered.length === 0 ? (
                <div className="empty">No hay conversaciones</div>
              ) : (
                filtered.map(conv => (
                  <ConversationCard
                    key={conv.id}
                    conversation={conv}
                    isSelected={selected?.id === conv.id}
                    onClick={() => setSelected(conv)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="right-panel">
            {!selected ? (
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <p>Selecciona una conversación</p>
                <span>Haz clic en un chat de la lista para ver los mensajes y el historial completo.</span>
              </div>
            ) : (
              <>
                <div className="messages-header">
                  <div className="msg-phone">{selected.phoneNumber || selected.phone_number}</div>
                  <span className={`status-badge ${selected.status === 'OPEN' ? 'open' : 'closed'}`}>
                    {selected.status === 'OPEN' ? '● Abierta' : '● Cerrada'}
                  </span>
                </div>
                <div className="messages-list">
                  {messages.map(msg => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .page { height: 100vh; display: flex; flex-direction: column; }
        .chat-container {
          display: flex;
          flex: 1;
          height: 100vh;
          overflow: hidden;
        }
        .left-panel {
          width: 380px;
          border-right: 1px solid #e5e7eb;
          background: white;
          display: flex;
          flex-direction: column;
          height: 100vh;
        }
        .left-header {
          padding: 20px 16px 12px;
          border-bottom: 1px solid #f3f4f6;
        }
        .panel-title {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 8px;
        }
        .header-right {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
        }
        .stat-pill {
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
        }
        .stat-pill.open { color: #16a34a; }
        .stat-pill.closed { color: #9ca3af; }
        .update-time { font-size: 11px; color: #9ca3af; margin-left: auto; }
        .search-box { padding: 10px 16px; }
        .search-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
        }
        .search-input:focus { border-color: #25D366; }
        .filter-tabs {
          display: flex;
          padding: 0 16px;
          gap: 4px;
          border-bottom: 1px solid #f3f4f6;
          padding-bottom: 8px;
        }
        .tab {
          padding: 6px 12px;
          border: none;
          background: none;
          font-size: 13px;
          color: #6b7280;
          cursor: pointer;
          border-radius: 6px;
          font-weight: 500;
        }
        .tab.active {
          background: #f0fdf4;
          color: #16a34a;
          font-weight: 600;
        }
        .conv-list { flex: 1; overflow-y: auto; }
        .empty { padding: 24px; text-align: center; color: #9ca3af; font-size: 14px; }
        .right-panel {
          flex: 1;
          background: #f9fafb;
          display: flex;
          flex-direction: column;
          height: 100vh;
        }
        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          text-align: center;
          padding: 32px;
        }
        .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.4; }
        .empty-state p { font-size: 16px; font-weight: 600; color: #6b7280; margin: 0 0 8px; }
        .empty-state span { font-size: 13px; }
        .messages-header {
          padding: 16px 24px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .msg-phone { font-size: 16px; font-weight: 600; color: #111827; }
        .status-badge { font-size: 12px; font-weight: 600; }
        .status-badge.open { color: #16a34a; }
        .status-badge.closed { color: #9ca3af; }
        .messages-list {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
        }
      `}</style>
    </Layout>
  );
}