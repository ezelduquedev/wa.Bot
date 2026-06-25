// components/MessageBubble.js

export default function MessageBubble({ message }) {
  // Verificamos si es del usuario o del asistente para cambiar el estilo
  const isUser = message.role === 'USER';

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      const dateStr = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      return `${timeStr} - ${dateStr}`;
    } catch {
      return '';
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      width: '100%',
      marginBottom: '8px',
      padding: '0 12px'
    }}>
      <div style={{
        maxWidth: '70%',
        padding: '10px 15px',
        borderRadius: '15px',
        backgroundColor: isUser ? '#25d366' : '#e5e7eb', // Verde WhatsApp para el cliente, gris para el bot
        color: isUser ? '#fff' : '#000',
        fontSize: '14px',
        wordWrap: 'break-word',
        boxShadow: '0 1px 1px rgba(0,0,0,0.05)'
      }}>
        {message.content}
      </div>
      {message.timestamp && (
        <span style={{
          fontSize: '10px',
          color: '#94a3b8',
          marginTop: '3px',
          padding: '0 4px'
        }}>
          {formatMessageTime(message.timestamp)}
        </span>
      )}
    </div>
  );
}