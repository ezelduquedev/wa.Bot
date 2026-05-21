import Link from 'next/link';
import { useRouter } from 'next/router';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/conversations', label: 'Conversaciones', icon: 'conversations' },
  { href: '/campaigns', label: 'Campañas', icon: 'campaigns' },
  { href: '/contacts', label: 'Contactos', icon: 'contacts' },
  { href: '/settings', label: 'Ajustes', icon: 'settings' },
];

export default function Layout({ children }) {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc' }}>
      <aside style={{
        width: 260,
        background: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 12px',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 8px 32px 8px' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#16a34a', letterSpacing: '-0.5px' }}>
            WA.Bot
          </div>
          <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Enterprise Messaging
          </div>
        </div>

        {/* Nuevo Broadcast */}
        <div style={{ marginBottom: 24 }}>
          <Link href="/campaigns">
            <div style={{
              background: '#16a34a',
              color: '#fff',
              borderRadius: 10,
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              transition: 'transform 0.1s, background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span style={{ fontSize: 16 }}>+</span> Nuevo Broadcast
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => {
            const active = router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: active ? 600 : 500,
                  color: active ? '#16a34a' : '#64748b',
                  background: active ? '#f0fdf4' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}>
                  <NavIcon name={item.icon} active={active} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
          <div style={{ padding: '8px 12px', fontSize: 13, color: '#64748b', cursor: 'pointer' }}>Ayuda</div>
          <div style={{ padding: '8px 12px', fontSize: 13, color: '#e11d48', cursor: 'pointer' }}>Cerrar sesión</div>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  );
}

function NavIcon({ name, active }) {
  const color = active ? '#16a34a' : '#94a3b8';
  // ... (puedes mantener tus SVGs aquí igual)
  return <div style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{/* Icono */}</div>
}