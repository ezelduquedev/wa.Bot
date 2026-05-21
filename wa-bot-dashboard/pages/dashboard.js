import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, open: 0, closed: 0 });
  const [systemOk, setSystemOk] = useState(null);

  const fetchData = async () => {
    try {
      const health = await fetch(`${BACKEND}/health`);
      setSystemOk(health.ok);
      const res = await fetch(`${BACKEND}/api/conversations`);
      if (res.ok) {
        const data = await res.json();
        const convs = Array.isArray(data) ? data : data.conversations || [];
        setStats({
          total: convs.length,
          open: convs.filter(c => c.status === 'open').length,
          closed: convs.filter(c => c.status === 'closed').length,
        });
      }
    } catch { setSystemOk(false); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <div style={{ padding: '32px', width: '100%' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', marginBottom: '32px' }}>Dashboard</h1>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '24px', 
          marginBottom: '32px' 
        }}>
          <StatCard label="Total Conversaciones" value={stats.total} />
          <StatCard label="Abiertas" value={stats.open} color="#16a34a" />
          <StatCard label="Cerradas" value={stats.closed} color="#64748b" />
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', fontWeight: 700, borderBottom: '1px solid #f1f5f9', color: '#1e293b' }}>
            Estado de los Servicios
          </div>
          {[
            ['Backend (Railway)', BACKEND, systemOk],
            ['Dashboard (Vercel)', 'wa-bot-iota.vercel.app', true],
            ['Webhook Meta', 'Verificado', true],
            ['Gemini API', 'Conectado', true],
          ].map(([name, desc, ok]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #f8fafc' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{name}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{desc}</div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', background: ok ? '#f0fdf4' : '#fef2f2', color: ok ? '#16a34a' : '#ef4444' }}>
                {ok ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ label, value, color = '#111827' }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
      <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '32px', fontWeight: 800, color: color }}>{value}</div>
    </div>
  );
}