import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import MessageBubble from '../components/MessageBubble';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

function Avatar({ name }) {
  const initials = name && name !== 'Desconocido'
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  return (
    <div className="avatar">
      {initials}
    </div>
  );
}

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected]           = useState(null);
  const [messages, setMessages]           = useState([]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selected) {
      fetchMessages(selected.id);
    }
  }, [selected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);

  async function fetchConversations() {
    try {
      const res = await fetch(`${BACKEND_URL}/api/conversations`);

      if (res.ok) {
        const data = await res.json();

        setConversations(
          Array.isArray(data)
            ? data
            : (data.conversations || [])
        );
      }
    } catch {}
  }

  // 🔥 AQUÍ ESTÁ LA MODIFICACIÓN IMPORTANTE
  async function fetchMessages(id) {
    try {
      console.log('Cargando mensajes de conversación:', id);

      const res = await fetch(
        `${BACKEND_URL}/api/conversations/${id}/messages`
      );

      console.log('Status mensajes:', res.status);

      const data = await res.json();

      console.log('Mensajes recibidos:', data);

      if (res.ok) {
        setMessages(
          Array.isArray(data)
            ? data
            : (data.messages || [])
        );
      } else {
        console.error('Error HTTP en mensajes:', data);
        setMessages([]);
      }

    } catch (err) {
      console.error('Error cargando mensajes:', err);
    }
  }

  const getLastMessageText = (conv) => {
    if (!conv.lastMessage) return 'Sin mensajes';

    if (typeof conv.lastMessage === 'string') {
      return conv.lastMessage;
    }

    return conv.lastMessage.content || 'Sin mensajes';
  };

  return (
    <Layout fullHeight>
      <div className="chat-container">

        {/* Sidebar */}
        <div className="chat-sidebar">
          <div className="chat-list">

            {conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setSelected(conv)}
                className={`chat-item ${
                  selected?.id === conv.id ? 'active' : ''
                }`}
              >
                <Avatar name={conv.contact?.name} />

                <div className="chat-info">
                  <div className="contact-name">
                    {
                      conv.contact?.name ||
                      conv.contact?.phone_number ||
                      'Desconocido'
                    }
                  </div>

                  <div className="last-msg">
                    {getLastMessageText(conv)}
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* Chat principal */}
        <div className="chat-main">

          {selected ? (
            <>
              <div className="chat-header">
                <strong>
                  {
                    selected.contact?.name ||
                    selected.contact?.phone_number ||
                    'Desconocido'
                  }
                </strong>
              </div>

              <div className="chat-messages">
                {messages.map((msg, i) => (
                  <MessageBubble
                    key={msg.id || i}
                    message={msg}
                  />
                ))}

                <div ref={messagesEndRef} />
              </div>
            </>
          ) : (
            <div className="chat-empty">
              Selecciona un chat
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}