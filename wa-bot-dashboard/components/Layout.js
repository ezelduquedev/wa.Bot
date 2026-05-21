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
    <div className="layout-container">
      <aside className="sidebar">
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green-dark)', marginBottom: 48, paddingLeft: 8 }}>
          WA.Bot
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {navItems.map(item => {
            const active = router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} className={`nav-link ${active ? 'active' : ''}`}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="main-content">
        <div style={{ maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}