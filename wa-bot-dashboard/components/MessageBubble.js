export default function MessageBubble({ message }) {
  const isAssistant = message.role === 'ASSISTANT';

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`bubble-wrap ${isAssistant ? 'assistant' : 'user'}`}>
      {isAssistant && <span className="bot-label">🤖 WA.Bot</span>}
      <div className={`bubble ${isAssistant ? 'bubble-assistant' : 'bubble-user'}`}>
        <p>{message.content}</p>
        <span className="time">{formatTime(message.timestamp)}</span>
      </div>

      <style jsx>{`
        .bubble-wrap {
          display: flex;
          flex-direction: column;
          margin-bottom: 12px;
        }
        .bubble-wrap.user { align-items: flex-end; }
        .bubble-wrap.assistant { align-items: flex-start; }
        .bot-label {
          font-size: 11px;
          color: #9ca3af;
          margin-bottom: 4px;
          margin-left: 4px;
        }
        .bubble {
          max-width: 70%;
          padding: 10px 14px;
          border-radius: 12px;
          position: relative;
        }
        .bubble p {
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
          word-break: break-word;
        }
        .bubble-user {
          background: #25D366;
          color: white;
          border-bottom-right-radius: 4px;
        }
        .bubble-assistant {
          background: #fff;
          color: #111827;
          border: 1px solid #e5e7eb;
          border-bottom-left-radius: 4px;
        }
        .time {
          display: block;
          font-size: 10px;
          margin-top: 4px;
          opacity: 0.7;
          text-align: right;
        }
      `}</style>
    </div>
  );
}