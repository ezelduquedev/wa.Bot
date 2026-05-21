import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

function Avatar({ name }) {
  const initials = name && name !== 'Desconocido' ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '??';
  return <div className="avatar">{initials}</div>;
}

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('all');
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
      const res = await fetch(`${BACKEND_URL}/api/conversations/${id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : (data.messages || []));
      }
    } catch {}
  }

  return (
    <Layout fullHeight>
      <div className="chat-container">
        {/* Panel Izquierdo: Lista */}
        <div className="chat-sidebar">
          <div className="chat-list">
            {conversations.map(conv => (
              <div 
                key={conv.id} 
                onClick={() => setSelected(conv)} 
                className={`chat-item ${selected?.id === conv.id ? 'active' : ''}`}
              >
                <Avatar name={conv.contact?.name} />
                <div className="chat-info">
                  <div className="contact-name">{conv.contact?.name || 'Desconocido'}</div>
                  <div className="last-msg">{conv.lastMessage || 'Sin mensajes'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel Derecho: Chat */}
        <div className="chat-main">
          {selected ? (
            <>
              <div className="chat-header">
                <strong>{selected.contact?.name}</strong>
              </div>
              <div className="chat-messages">
                {messages.map((msg, i) => (
                  <div key={i} className={`msg ${msg.direction}`}>
                    {msg.content || msg.body}
                  </div>
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