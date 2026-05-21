import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

function StatCard({ icon, value, label, color }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: '20px 24px',
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: color + '15',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, color: color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  );
}

function StatusRow({ label, detail, status }) {
  const statusConfig = {
    ok: { label: 'Activo', color: '#16a34a', bg: '#f0fdf4', dot: '#22c55e' },
    pending: { label: 'Pendiente', color: '#d97706', bg: '#fffbeb', dot: '#f59e0b' },
    error: { label: 'Error', color: '#dc2626', bg: '#fef2f2', dot: '#ef4444' },
  };
  const cfg = statusConfig[status] || statusConfig.pending;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 0',
      borderBottom: '1px solid #f3f4f6',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%', background: cfg.dot, flexShrink: 0,
        }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{label}</div>
          {detail && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>{detail}</div>}
        </div>
      </div>
      <span style={{
        fontSize: 12, fontWeight: 600, color: cfg.color,
        background: cfg.bg, padding: '3px 10px', borderRadius: 20,
      }}>
        {cfg.label}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, open: 0, closed: 0 });
  const [backendOk, setBackendOk] = useState(null);
  const [lastUpdate, setLastUpdate] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    const now = new Date();
    setLastUpdate(now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
    try {
      const res = await fetch(`${BACKEND_URL}/api/conversations`);
      if (res.ok) {
        const data = await res.json();
        const conversations = Array.isArray(data) ? data : (data.conversations || []);
        const open = conversations.filter(c => c.status === 'open').length;
        const closed = conversations.filter(c => c.status === 'closed').length;
        setStats({ total: conversations.length, open, closed });
        setBackendOk(true);
      } else {
        setBackendOk(false);
      }
    } catch {
      setBackendOk(false);
    }
  }

  return (
    <Layout>
      <div style={{ padding: '28px 32px', maxWidth: 1100 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>Dashboard</h1>
            <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>Última actualización: {lastUpdate}</p>
          </div>
          <button
            onClick={fetchData}
            style={{
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
              padding: '8px 12px', cursor: 'pointer', color: '#6b7280', fontSize: 16,
            }}
          >
            ↻
          </button>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 28, marginTop: 20 }}>
          <StatCard
            icon={<ConvIcon color="#374151" />}
            value={stats.total}
            label="Total conversaciones"
            color="#374151"
          />
          <StatCard
            icon={<ConvIcon color="#25D366" />}
            value={stats.open}
            label="Abiertas"
            color="#16a34a"
          />
          <StatCard
            icon={<ConvIcon color="#9ca3af" />}
            value={stats.closed}
            label="Cerradas"
            color="#6b7280"
          />
        </div>

        {/* System status */}
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px',
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Estado del sistema</h2>
          <StatusRow
            label="WhatsApp Cloud API"
            detail="Meta Business"
            status="ok"
          />
          <StatusRow
            label="Gemini IA"
            detail="Integrado en backend"
            status="ok"
          />
          <StatusRow
            label="PostgreSQL"
            detail="Railway database"
            status="ok"
          />
          <StatusRow
            label="Deploy Railway"
            detail={BACKEND_URL}
            status={backendOk === true ? 'ok' : backendOk === false ? 'error' : 'pending'}
          />
          <div style={{ borderBottom: 'none' }}>
            <StatusRow
              label="Deploy Vercel"
              detail="wa-bot-iota.vercel.app"
              status="ok"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ConvIcon({ color }) {
  return (
    <svg width="22" height="22" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}