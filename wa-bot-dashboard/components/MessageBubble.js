export default function MessageBubble({ message }) {
  const isBot = message.role === 'ASSISTANT' || message.direction === 'outbound';

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: isBot ? 'flex-end' : 'flex-start',
      marginBottom: '8px',
      padding: '0 16px',
    }}>
      <div style={{
        maxWidth: '70%',
        background: isBot ? '#25D366' : '#fff',
        color: isBot ? '#fff' : '#111827',
        borderRadius: isBot ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding: '10px 14px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
        border: isBot ? 'none' : '1px solid #e5e7eb',
      }}>
        <div style={{ fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
          {message.content}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          gap: '4px', marginTop: '4px',
        }}>
          {isBot && <span style={{ fontSize: '12px' }}>🤖</span>}
          {!isBot && <span style={{ fontSize: '12px' }}>👤</span>}
          <span style={{ fontSize: '11px', color: isBot ? 'rgba(255,255,255,0.75)' : '#9ca3af' }}>
            {formatTime(message.timestamp || message.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}