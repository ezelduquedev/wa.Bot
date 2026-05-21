import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Layout({ children }) {
  const router = useRouter();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '⊞' },
    { href: '/conversations', label: 'Conversaciones', icon: '💬' },
    { href: '/campaigns', label: 'Campañas', icon: '📢' },
    { href: '/contacts', label: 'Contactos', icon: '👤' },
    { href: '/settings', label: 'Ajustes', icon: '⚙️' },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-text">WA.Bot</span>
          <span className="logo-sub">ENTERPRISE MESSAGING</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${router.pathname === item.href ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <a href="#" className="nav-item">
            <span className="nav-icon">❓</span>
            <span className="nav-label">Ayuda</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">→</span>
            <span className="nav-label">Cerrar sesión</span>
          </a>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>

      <style jsx>{`
        .layout {
          display: flex;
          min-height: 100vh;
          background: #f5f7fa;
        }
        .sidebar {
          width: 220px;
          min-height: 100vh;
          background: #fff;
          border-right: 1px solid #e8ecf0;
          display: flex;
          flex-direction: column;
          padding: 0;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 100;
        }
        .sidebar-logo {
          padding: 24px 20px 20px;
          border-bottom: 1px solid #f0f2f5;
        }
        .logo-text {
          display: block;
          font-size: 22px;
          font-weight: 800;
          color: #25D366;
          letter-spacing: -0.5px;
        }
        .logo-sub {
          display: block;
          font-size: 9px;
          color: #9ca3af;
          letter-spacing: 1.5px;
          margin-top: 2px;
        }
        .sidebar-nav {
          flex: 1;
          padding: 12px 10px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 8px;
          color: #6b7280;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 2px;
          transition: all 0.15s;
          cursor: pointer;
        }
        .nav-item:hover {
          background: #f3f4f6;
          color: #111827;
        }
        .nav-item.active {
          background: #f0fdf4;
          color: #16a34a;
          font-weight: 600;
        }
        .nav-icon {
          font-size: 16px;
          width: 20px;
          text-align: center;
        }
        .sidebar-footer {
          padding: 12px 10px;
          border-top: 1px solid #f0f2f5;
        }
        .main-content {
          margin-left: 220px;
          flex: 1;
          min-height: 100vh;
        }
      `}</style>
    </div>
  );
}