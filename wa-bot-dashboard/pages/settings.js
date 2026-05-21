import { useState } from 'react';
import Layout from '../components/Layout';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [adminKey, setAdminKey] = useState(''); // Estado para la clave

  async function performAction(endpoint, label) {
    if (!adminKey) { alert('Por favor, ingresa la Clave de Administrador.'); return; }
    if (!confirm(`¿Estás seguro de que deseas ${label}?`)) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/admin/${endpoint}`, { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-key': adminKey // Se envía la clave aquí
        }
      });
      if (res.ok) alert(`${label} completada exitosamente.`);
      else alert('Error: Clave incorrecta o fallo en el servidor.');
    } catch {
      alert('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="content-wrapper" style={{ maxWidth: 800 }}>
        <h1 style={{ marginBottom: 28 }}>Ajustes del Sistema</h1>

        {/* Configuración de seguridad */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">Autenticación de Administrador</div>
          <div style={{ padding: 24 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Clave de Acceso (Admin Key)</label>
              <input 
                type="password"
                className="form-input" 
                placeholder="Ingresa tu clave secreta..."
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Acciones de Administración */}
        <div className="card">
          <div className="card-header">Acciones Críticas</div>
          <div style={{ padding: 24, display: 'flex', gap: 16 }}>
            <button 
              className="action-btn" 
              disabled={loading}
              onClick={() => performAction('restart', 'reiniciar el servicio')}
              style={{ background: '#f59e0b', color: '#fff' }}
            >
              {loading ? 'Procesando...' : '🔄 Reiniciar Servicio'}
            </button>
            
            <button 
              className="action-btn" 
              disabled={loading}
              onClick={() => performAction('clear-db', 'limpiar la base de datos')}
              style={{ background: 'var(--red)', color: '#fff' }}
            >
              {loading ? 'Procesando...' : '🗑️ Limpiar Base de Datos'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}