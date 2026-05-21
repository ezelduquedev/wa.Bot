import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, open: 0, closed: 0 });
  const [lastUpdate, setLastUpdate] = useState('');

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/conversations`);
      const convs = res.data || [];
      const open = convs.filter(c => c.status === 'OPEN').length;
      const closed = convs.filter(c => c.status === 'CLOSED').length;
      setStats({ total: convs.length, open, closed });
      setLastUpdate(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      console.error('Error fetching stats:', e);
    }
  };

  const systemStatus = [
    { name: 'WhatsApp Cloud API', status: 'Activo', ok: true },
    { name: 'Gemini IA', status: 'Activo', ok: true },
    { name: 'PostgreSQL', status: 'Activo', ok: true },
    { name: 'Deploy Railway', status: 'Activo', ok: true },
    { name: 'Deploy Vercel', status: 'Activo', ok: true },
  ];

  return (
    <Layout>
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            {lastUpdate && <p className="page-sub">Última actualización: {lastUpdate}</p>}
          </div>
          <div className="avatar-btn">N</div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">TOTAL CONVERSACIONES</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🟢</div>
            <div className="stat-value">{stats.open}</div>
            <div className="stat-label">ABIERTAS</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⬜</div>
            <div className="stat-value">{stats.closed}</div>
            <div className="stat-label">CERRADAS</div>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">Estado del sistema</h2>
          <div className="status-list">
            {systemStatus.map((item) => (
              <div key={item.name} className="status-row">
                <div className="status-left">
                  <span className={`dot ${item.ok ? 'dot-green' : 'dot-orange'}`}></span>
                  <span className="status-name">{item.name}</span>
                </div>
                <span className={`status-val ${item.ok ? 'val-green' : 'val-orange'}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .page {
          padding: 32px;
          max-width: 900px;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 28px;
        }
        .page-title {
          font-size: 26px;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }
        .page-sub {
          font-size: 13px;
          color: #9ca3af;
          margin: 4px 0 0;
        }
        .avatar-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #111827;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }
        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px 24px;
          border: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .stat-icon { font-size: 22px; }
        .stat-value {
          font-size: 28px;
          font-weight: 800;
          color: #111827;
          line-height: 1;
        }
        .stat-label {
          font-size: 10px;
          color: #9ca3af;
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-top: 2px;
        }
        .section {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          padding: 24px;
        }
        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 16px;
        }
        .status-list { display: flex; flex-direction: column; gap: 0; }
        .status-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        .status-row:last-child { border-bottom: none; }
        .status-left { display: flex; align-items: center; gap: 10px; }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .dot-green { background: #22c55e; }
        .dot-orange { background: #f59e0b; }
        .status-name { font-size: 14px; color: #374151; }
        .status-val { font-size: 13px; font-weight: 600; }
        .val-green { color: #16a34a; }
        .val-orange { color: #d97706; }
      `}</style>
    </Layout>
  );
}