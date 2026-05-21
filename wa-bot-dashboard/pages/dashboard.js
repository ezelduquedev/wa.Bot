import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

// Definimos los endpoints que existen en tu server.js
const services = [
  { name: 'Backend API', endpoint: '' }, 
  { name: 'WhatsApp Service', endpoint: 'webhook' }, 
  { name: 'Base de datos', endpoint: 'health/db' }
];

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, open: 0, closed: 0 });
  const [serviceStatus, setServiceStatus] = useState({});

  async function fetchData() {
    // 1. Obtener estadísticas
    try {
      const res = await fetch(`${BACKEND}/api/conversations`);
      if (res.ok) {
        const data = await res.json();
        const convs = Array.isArray(data) ? data : (data.conversations || []);
        setStats({
          total: convs.length,
          open: convs.filter(c => c.status === 'open').length,
          closed: convs.filter(c => c.status === 'closed').length,
        });
      }
    } catch (e) { console.error("Error fetching stats", e); }

    // 2. Verificar estado de servicios
    for (const svc of services) {
      try {
        const res = await fetch(`${BACKEND}/${svc.endpoint}`, { method: 'GET' });
        setServiceStatus(prev => ({ ...prev, [svc.name]: res.status < 500 }));
      } catch {
        setServiceStatus(prev => ({ ...prev, [svc.name]: false }));
      }
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Resumen general</p>
      </div>

      <div className="dashboard-grid">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Abiertas" value={stats.open} color="var(--active-text)" />
        <StatCard label="Cerradas" value={stats.closed} color="var(--text-muted)" />
      </div>

      <div className="two-col-grid">
        <div className="card">
          <div className="card-header">Estado del Sistema</div>
          {services.map(svc => (
            <div key={svc.name} className="status-item">
              <span style={{ fontSize: 14, fontWeight: 500 }}>{svc.name}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: serviceStatus[svc.name] ? 'var(--status-ok)' : 'var(--red)' }}>
                {serviceStatus[svc.name] === undefined ? 'Verificando...' : (serviceStatus[svc.name] ? 'OPERATIVO' : 'SIN CONEXIÓN')}
              </span>
            </div>
          ))}
        </div>
        
        <div className="card">
          <div className="card-header">Acciones Rápidas</div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Ver conversaciones', href: '/conversations' }, 
              { label: 'Crear campaña', href: '/campaigns' }
            ].map(a => (
              <a key={a.href} href={a.href} className="action-btn">
                {a.label} <span>→</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
      <div className="stat-card-value" style={{ color }}>{value}</div>
    </div>
  );
}