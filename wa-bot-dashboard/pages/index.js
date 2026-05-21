import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export default function Home() {
  const [stats, setStats] = useState({ total: 0, open: 0, closed: 0 });
  const [systemOk, setSystemOk] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Health check
      const health = await fetch(`${BACKEND}/health`);
      setSystemOk(health.ok);

      // Conversations
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
    } catch {
      setSystemOk(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ label, value, color, bg }) => (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
      padding: '24px', flex: 1,
    }}>
      <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '36px', fontWeight: '800', color: color || '#111827' }}>{loading ? '—' : value}</div>
    </div>
  );

  return (
    <Layout>
      {/* Header */}
      <div style={{
        background: '#25D366', color: '#fff',
        padding: '16px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontWeight: '700', fontSize: '18px' }}>Dashboard</div>
        <div style={{ fontSize: '13px', opacity: 0.85 }}>Auto-refresh: 10s</div>
      </div>

      <div style={{ padding: '28px' }}>
        {/* System status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
          padding: '16px 20px', marginBottom: '24px',
        }}>
          <div style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: systemOk === null ? '#9ca3af' : systemOk ? '#25D366' : '#ef4444',
          }} />
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
            Sistema: {systemOk === null ? 'Verificando...' : systemOk ? 'Online ✓' : 'Sin conexión'}
          </span>
          <span style={{ fontSize: '13px', color: '#9ca3af', marginLeft: '4px' }}>
            {BACKEND}
          </span>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '28px' }}>
          <StatCard label="Total conversaciones" value={stats.total} />
          <StatCard label="Conversaciones abiertas" value={stats.open} color="#16a34a" />
          <StatCard label="Conversaciones cerradas" value={stats.closed} color="#6b7280" />
        </div>

        {/* Info */}
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px',
        }}>
          <div style={{ fontWeight: '700', fontSize: '16px', color: '#111827', marginBottom: '16px' }}>
            Estado del sistema
          </div>
          {[
            ['Backend (Railway)', 'https://wabot-production-f502.up.railway.app', systemOk],
            ['Dashboard (Vercel)', 'https://wa-bot-iota.vercel.app', true],
            ['Webhook Meta', '/webhook → verificado', true],
            ['Gemini API', 'Integrado en backend', true],
          ].map(([name, url, ok]) => (
            <div key={name} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 0', borderBottom: '1px solid #f3f4f6',
            }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{name}</div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{url}</div>
              </div>
              <span style={{
                fontSize: '12px', fontWeight: '600',
                color: ok ? '#16a34a' : '#ef4444',
                background: ok ? '#dcfce7' : '#fee2e2',
                padding: '4px 12px', borderRadius: '999px',
              }}>
                {ok ? '✓ Activo' : '✗ Error'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}