export default function ConversationCard({ conversation, onClick }) {
  const lastMsg = conversation.messages?.[conversation.messages.length - 1];

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Ayer';
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric' });
  };

  const getInitials = (phone) => {
    const digits = phone?.replace(/\D/g, '') || '';
    return digits.slice(-2);
  };

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '14px 20px',
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        marginBottom: '8px',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#25D366'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
    >
      {/* Avatar */}
      <div style={{
        width: '44px', height: '44px',
        borderRadius: '50%',
        background: '#dcfce7',
        color: '#16a34a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: '700', fontSize: '15px',
        flexShrink: 0,
      }}>
        {getInitials(conversation.phoneNumber)}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>
          {conversation.phoneNumber}
        </div>
        <div style={{
          fontSize: '13px', color: '#6b7280',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          marginTop: '2px',
        }}>
          {lastMsg?.content || 'Sin mensajes'}
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
          {lastMsg ? formatTime(lastMsg.createdAt) : ''}
        </span>
        <span style={{
          fontSize: '12px', fontWeight: '600',
          color: conversation.status === 'open' ? '#16a34a' : '#6b7280',
          background: conversation.status === 'open' ? '#dcfce7' : '#f3f4f6',
          padding: '2px 8px', borderRadius: '999px',
        }}>
          {conversation.status === 'open' ? 'Abierta' : 'Cerrada'}
        </span>
      </div>
    </div>
  );
}