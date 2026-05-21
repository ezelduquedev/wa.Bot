import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

function StatCard({ icon, value, label, color }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 16, // Más redondeado para look moderno
      padding: '28px',
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', // Sombra sutil para profundidad
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 12,
        background: color + '10', // Color más suave
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 32, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</div>
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
      padding: '18px 0',
      borderBottom: '1px solid #f9fafb',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.dot, boxShadow: `0 0 8px ${cfg.dot}` }} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#111827' }}>{label}</div>
          {detail && <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{detail}</div>}
        </div>
      </div>
      <span style={{
        fontSize: 12, fontWeight: 600, color: cfg.color,
        background: cfg.bg, padding: '4px 12px', borderRadius: 6,
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
    setLastUpdate(now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
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
      <div style={{ padding: '40px 60px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0 }}>Dashboard</h1>
            <p style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>Estado operativo en tiempo real</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>Última actualización: {lastUpdate}</div>
            <button
              onClick={fetchData}
              style={{
                background: '#111827', border: 'none', borderRadius: 8,
                padding: '10px 20px', cursor: 'pointer', color: '#fff', fontSize: 14, fontWeight: 500,
              }}
            >
              Actualizar Ahora
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 40 }}>
          <StatCard icon={<ConvIcon color="#111827" />} value={stats.total} label="Total Chats" color="#111827" />
          <StatCard icon={<ConvIcon color="#16a34a" />} value={stats.open} label="Abiertas" color="#16a34a" />
          <StatCard icon={<ConvIcon color="#6b7280" />} value={stats.closed} label="Cerradas" color="#6b7280" />
        </div>

        {/* System status */}
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '32px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 20 }}>Estado del sistema</h2>
          <StatusRow label="WhatsApp Cloud API" detail="Meta Business" status="ok" />
          <StatusRow label="Gemini IA" detail="Integrado en backend" status="ok" />
          <StatusRow label="PostgreSQL" detail="Railway database" status="ok" />
          <StatusRow label="Deploy Railway" detail={BACKEND_URL} status={backendOk === true ? 'ok' : backendOk === false ? 'error' : 'pending'} />
          <StatusRow label="Deploy Vercel" detail="wa-bot-iota.vercel.app" status="ok" />
        </div>
      </div>
    </Layout>
  );
}

function ConvIcon({ color }) {
  return (
    <svg width="24" height="24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}