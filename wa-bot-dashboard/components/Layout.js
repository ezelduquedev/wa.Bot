import Link from 'next/link';
import { useRouter } from 'next/router';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/conversations', label: 'Conversaciones' },
  { href: '/campaigns', label: 'Campañas' },
  { href: '/contacts', label: 'Contactos' },
  { href: '/settings', label: 'Ajustes' },
];

export default function Layout({ children }) {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', overflow: 'hidden' }}>
      {/* Sidebar fijo y profesional */}
      <aside style={{
        width: 260,
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 20px',
      }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#16a34a', marginBottom: 48, paddingLeft: 8 }}>
          WA.Bot
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {navItems.map(item => {
            const active = router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 10, fontSize: 15,
                  fontWeight: active ? 600 : 500,
                  color: active ? '#16a34a' : '#475569',
                  background: active ? '#f0fdf4' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main área expandible al máximo */}
      <main style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '40px', // Espaciado generoso para escritorio
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        <div style={{ maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}