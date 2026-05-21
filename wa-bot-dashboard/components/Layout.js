import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Layout({ children }) {
  const router = useRouter();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '⊞', emoji: true },
    { href: '/conversations', label: 'Conversaciones', icon: '📢', emoji: true },
    { href: '/campaigns', label: 'Campañas', icon: '👤', emoji: true },
    { href: '/contacts', label: 'Contactos', icon: '👤', emoji: true },
    { href: '/settings', label: 'Ajustes', icon: '⚙️', emoji: true },
  ];

  const isActive = (href) => {
    if (href === '/') return router.pathname === '/';
    return router.pathname.startsWith(href);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: '200px',
        minWidth: '200px',
        background: '#fff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 20px 16px 20px',
          borderBottom: '1px solid #e5e7eb',
        }}>
          <div style={{ fontWeight: '800', fontSize: '22px', color: '#25D366', letterSpacing: '-0.5px' }}>
            WA.Bot
          </div>
          <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '600', letterSpacing: '1.5px', marginTop: '2px' }}>
            ENTERPRISE MESSAGING
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: isActive(item.href) ? '600' : '400',
                color: isActive(item.href) ? '#111827' : '#6b7280',
                background: isActive(item.href) ? '#f3f4f6' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
                borderLeft: isActive(item.href) ? '3px solid #25D366' : '3px solid transparent',
              }}>
                <span style={{ fontSize: '15px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        {/* Bottom links */}
        <div style={{ padding: '12px 0', borderTop: '1px solid #e5e7eb' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 20px', fontSize: '14px', color: '#6b7280', cursor: 'pointer'
          }}>
            <span>❓</span><span>Ayuda</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 20px', fontSize: '14px', color: '#6b7280', cursor: 'pointer'
          }}>
            <span>→</span><span>Cerrar sesión</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, background: '#f9fafb', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
}