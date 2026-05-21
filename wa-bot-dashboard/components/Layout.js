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
      <aside style={{
        width: 240,
        minWidth: 240,
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
      }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#16a34a', marginBottom: 40, paddingLeft: 8 }}>
          WA.Bot
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {navItems.map(item => {
            const active = router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 8, fontSize: 14,
                  fontWeight: active ? 600 : 500,
                  color: active ? '#16a34a' : '#64748b',
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

      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  );
}