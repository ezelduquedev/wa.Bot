import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import MessageBubble from '../components/MessageBubble';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

function Avatar({ name }) {
  const initials = name && name !== 'Desconocido'
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??';
  return <div className="avatar">{initials}</div>;
}

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected]           = useState(null);
  const [messages, setMessages]           = useState([]);
  // Mobile: track whether to show list or chat panel
  const [showChat, setShowChat]           = useState(false);

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
      const res  = await fetch(`${BACKEND_URL}/api/conversations/${id}/messages`);
      const data = await res.json();
      setMessages(res.ok ? (Array.isArray(data) ? data : (data.messages || [])) : []);
    } catch { console.error('Error cargando mensajes'); }
  }

  function handleSelectConv(conv) {
    setSelected(conv);
    setShowChat(true);
  }

  const getLastMessageText = (conv) => {
    if (!conv.lastMessage) return 'Sin mensajes';
    if (typeof conv.lastMessage === 'string') return conv.lastMessage;
    return conv.lastMessage.content || 'Sin mensajes';
  };

  return (
    <Layout fullHeight>
      <div className="chat-container">

        {/* Sidebar / lista de conversaciones */}
        {/* En móvil se oculta con la clase CSS 'hidden' cuando el chat está abierto */}
        <div className={`chat-sidebar${showChat ? ' hidden' : ''}`}>
          <div className="chat-list">
            {conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => handleSelectConv(conv)}
                className={`chat-item ${selected?.id === conv.id ? 'active' : ''}`}
              >
                <Avatar name={conv.contact?.name} />
                <div className="chat-info">
                  <div className="contact-name">
                    {conv.contact?.name || conv.contact?.phone_number || 'Desconocido'}
                  </div>
                  <div className="last-msg">{getLastMessageText(conv)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel principal del chat */}
        {/* En móvil se oculta con la clase CSS 'hidden' cuando el chat NO está abierto */}
        <div className={`chat-main${!showChat ? ' hidden' : ''}`}>
          {selected ? (
            <>
              <div className="chat-header" style={{ display: 'flex', alignItems: 'center' }}>
                {/* Botón "volver" solo visible en móvil via CSS (.back-btn) */}
                <button
                  className="back-btn"
                  onClick={() => setShowChat(false)}
                  aria-label="Volver a la lista"
                >
                  ←
                </button>
                <strong>
                  {selected.contact?.name || selected.contact?.phone_number || 'Desconocido'}
                </strong>
              </div>

              <div className="chat-messages">
                {messages.map((msg, i) => (
                  <MessageBubble key={msg.id || i} message={msg} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </>
          ) : (
            <div className="chat-empty">Selecciona un chat</div>
          )}
        </div>

      </div>
    </Layout>
  );
}