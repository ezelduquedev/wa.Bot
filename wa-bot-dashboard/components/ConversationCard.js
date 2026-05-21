export default function ConversationCard({ conversation, isSelected, onClick }) {
  const { phoneNumber, lastMessage, status, unreadCount } = conversation;

  const getInitials = (phone) => {
    const digits = phone.replace(/\D/g, '');
    return digits.slice(-2);
  };

  const getAvatarColor = (phone) => {
    const colors = ['#25D366', '#128C7E', '#075E54', '#34B7F1', '#00a884'];
    const index = phone.charCodeAt(phone.length - 1) % colors.length;
    return colors[index];
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Ayer';
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className={`card ${isSelected ? 'selected' : ''}`} onClick={onClick}>
      <div className="avatar" style={{ background: getAvatarColor(phoneNumber) }}>
        {getInitials(phoneNumber)}
      </div>
      <div className="info">
        <div className="header">
          <span className="phone">{phoneNumber}</span>
          <span className="time">{formatTime(lastMessage?.timestamp)}</span>
        </div>
        <div className="preview-row">
          <span className="preview">
            {lastMessage?.role === 'ASSISTANT' && '🤖 '}
            {lastMessage?.content?.slice(0, 45) || 'Sin mensajes'}
            {lastMessage?.content?.length > 45 ? '...' : ''}
          </span>
          <span className={`badge ${status === 'OPEN' ? 'open' : 'closed'}`}>
            {status === 'OPEN' ? '● Abierta' : '● Cerrada'}
          </span>
        </div>
      </div>

      <style jsx>{`
        .card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid #f3f4f6;
          transition: background 0.1s;
        }
        .card:hover { background: #f9fafb; }
        .card.selected { background: #f0fdf4; }
        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 13px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .info { flex: 1; min-width: 0; }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3px;
        }
        .phone {
          font-size: 13px;
          font-weight: 600;
          color: #111827;
        }
        .time {
          font-size: 11px;
          color: #9ca3af;
        }
        .preview-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }
        .preview {
          font-size: 12px;
          color: #6b7280;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .badge {
          font-size: 10px;
          font-weight: 600;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .badge.open { color: #16a34a; }
        .badge.closed { color: #9ca3af; }
      `}</style>
    </div>
  );
}