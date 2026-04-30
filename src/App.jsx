import React, { useState } from 'react';
import TimelineView from './components/TimelineView';
import Login from './components/Login';
import { LogOut } from 'lucide-react';
import './index.css';

function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="app-container">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Planning Propietarios
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1.1rem' }}>
            Visualización de ocupación y reservas en tiempo real.
          </p>
        </div>
        
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right', display: 'none' }}>
               {/* Podríamos mostrar el email del usuario en escritorio si quisiéramos */}
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '600'
              }}
            >
              <LogOut size={18} />
              Salir
            </button>
          </div>
        )}
      </header>
      
      <main style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {user ? (
          <TimelineView user={user} />
        ) : (
          <Login onLogin={setUser} />
        )}
      </main>
      
      <footer style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <p>© {new Date().getFullYear()} Planning Propietarios. Todos los derechos reservados.</p>
        <p>Conectado a Google Sheets para sincronización automática.</p>
      </footer>
    </div>
  );
}

export default App;
