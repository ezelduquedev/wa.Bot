import Link from 'next/link';
import { useRouter } from 'next/router';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { href: '/conversations', label: 'Conversaciones', icon: '💬' },
  { href: '/campaigns', label: 'Campañas', icon: '📣' },
  { href: '/contacts', label: 'Contactos', icon: '👤' },
  { href: '/settings', label: 'Ajustes', icon: '⚙' },
];

export default function Layout({ children }) {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <aside style={{
        width: 260,
        minWidth: 260,
        background: '#fff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#25D366', letterSpacing: '-0.5px' }}>
            WA.Bot
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>
            Enterprise Messaging
          </div>
        </div>

        {/* Nuevo Broadcast button */}
        <div style={{ padding: '16px 16px 8px' }}>
          <Link href="/campaigns">
            <div style={{
              background: '#25D366',
              color: '#fff',
              borderRadius: 8,
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#1db954'}
              onMouseLeave={e => e.currentTarget.style.background = '#25D366'}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
              Nuevo Broadcast
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(item => {
            const active = router.pathname === item.href || router.pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '9px 12px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#16a34a' : '#374151',
                  background: active ? '#f0fdf4' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#f9fafb'; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; } }}
                >
                  <NavIcon name={item.href.replace('/', '')} active={active} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '12px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '9px 12px', borderRadius: 8, fontSize: 14,
            color: '#6b7280', cursor: 'pointer',
          }}>
            <span style={{ fontSize: 16 }}>?</span> Ayuda
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '9px 12px', borderRadius: 8, fontSize: 14,
            color: '#6b7280', cursor: 'pointer',
          }}>
            <span style={{ fontSize: 16 }}>→</span> Cerrar sesión
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: 'auto', background: '#f9fafb' }}>
        {children}
      </main>
    </div>
  );
}

function NavIcon({ name, active }) {
  const color = active ? '#16a34a' : '#6b7280';
  const icons = {
    dashboard: (
      <svg width="18" height="18" fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    conversations: (
      <svg width="18" height="18" fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    campaigns: (
      <svg width="18" height="18" fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M22 3L9.218 10.083M11.698 20.334L7 11l15-8L11.698 20.334z" />
      </svg>
    ),
    contacts: (
      <svg width="18" height="18" fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
    settings: (
      <svg width="18" height="18" fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  };
  return icons[name] || null;
}