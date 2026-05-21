export default function ConversationCard({ conversation, onClick, isSelected }) {
  const lastMsg = conversation.messages?.[conversation.messages.length - 1];

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Ayer';
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric' });
  };

  const name = conversation.contact?.name || conversation.phoneNumber || 'Desconocido';
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '16px',
        background: isSelected ? '#f0fdf4' : '#fff',
        border: `1px solid ${isSelected ? '#16a34a' : '#e5e7eb'}`,
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        marginBottom: '8px',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: '42px', height: '42px',
        borderRadius: '12px',
        background: isSelected ? '#dcfce7' : '#f3f4f6',
        color: isSelected ? '#166534' : '#64748b',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: '700', fontSize: '14px',
        flexShrink: 0,
      }}>
        {initials}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: '600', fontSize: '14px', color: '#111827', marginBottom: '2px' }}>
          {name}
        </div>
        <div style={{
          fontSize: '13px', color: '#64748b',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {lastMsg?.content || 'Sin mensajes recientes'}
        </div>
      </div>

      {/* Status & Time */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
          {lastMsg ? formatTime(lastMsg.createdAt) : ''}
        </span>
        <div style={{
          fontSize: '10px', fontWeight: '700', textTransform: 'uppercase',
          color: conversation.status === 'open' ? '#16a34a' : '#64748b',
          background: conversation.status === 'open' ? '#dcfce7' : '#f1f5f9',
          padding: '2px 8px', borderRadius: '6px',
        }}>
          {conversation.status === 'open' ? 'Abierta' : 'Cerrada'}
        </div>
      </div>
    </div>
  );
}