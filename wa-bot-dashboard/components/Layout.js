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
        <div style={{ padding: '32px 20px 24px 20px', borderBottom: '1px solid var(--sidebar-border)' }}>
          <h2 style={{ color: 'var(--green-dark)', fontSize: '22px' }}>WA.Bot</h2>
          <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, marginTop: 4 }}>DESARROLLADO POR EZEL</p>
        </div>

        <nav className="nav-menu">
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
        <div className="content-wrapper">{children}</div>
      </main>
    </div>
  );
}