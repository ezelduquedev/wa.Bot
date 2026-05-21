import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, open: 0, closed: 0 });
  const [systemOk, setSystemOk] = useState(null);

  // ... (tu lógica de fetchData se mantiene igual)

  return (
    <Layout>
      <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginBottom: '32px' }}>Dashboard</h1>

      {/* Grid de 3 columnas fijas en escritorio */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '24px', 
        marginBottom: '40px' 
      }}>
        <StatCard label="Total Conversaciones" value={stats.total} />
        <StatCard label="Abiertas" value={stats.open} color="#16a34a" />
        <StatCard label="Cerradas" value={stats.closed} color="#64748b" />
      </div>

      {/* Tabla de servicios ancha */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', fontSize: '18px', fontWeight: 700 }}>
          Estado del Sistema
        </div>
        {/* Aquí tus servicios se verán como una tabla profesional */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
           {/* ... tu mapeo de servicios aquí ... */}
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ label, value, color = '#0f172a' }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px' }}>
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', marginBottom: '12px' }}>{label}</div>
      <div style={{ fontSize: '42px', fontWeight: 800, color: color }}>{value}</div>
    </div>
  );
}