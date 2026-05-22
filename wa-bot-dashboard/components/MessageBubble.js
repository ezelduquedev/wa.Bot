// components/MessageBubble.js

export default function MessageBubble({ message }) {
  // Verificamos si es del usuario o del asistente para cambiar el estilo
  const isUser = message.role === 'USER';

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      width: '100%',
      marginBottom: '8px'
    }}>
      <div style={{
        maxWidth: '70%',
        padding: '10px 15px',
        borderRadius: '15px',
        backgroundColor: isUser ? '#25d366' : '#e5e7eb', // Verde WhatsApp para ti, gris para el cliente
        color: isUser ? '#fff' : '#000',
        fontSize: '14px',
        wordWrap: 'break-word'
      }}>
        {message.content}
      </div>
    </div>
  );
}