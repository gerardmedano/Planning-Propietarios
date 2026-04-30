import React, { useState } from 'react';
import { Lock, Mail, Loader } from 'lucide-react';
import { fetchPermissions } from '../services/googleSheets';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !code) {
      setError("Por favor, introduce el email y el código.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const permissions = await fetchPermissions();
      
      // Buscar en el CSV con búsqueda flexible de columnas para evitar problemas de espacios
      const userApts = [];
      let foundUser = false;
      let isAdmin = false;

      permissions.forEach(row => {
        const keys = Object.keys(row);
        const emailKey = keys.find(k => k.toLowerCase().includes('email') || k.toLowerCase().includes('usuario'));
        const passwordKey = keys.find(k => k.toLowerCase().includes('contraseña') || k.toLowerCase().includes('acceso'));
        const aptsKey = keys.find(k => k.toLowerCase().includes('apartamentos') || k.toLowerCase().includes('apto'));

        const rowEmail = emailKey ? (row[emailKey] || '').trim().toLowerCase() : '';
        const rowCode = passwordKey ? (row[passwordKey] || '').trim() : '';
        const rowAptsStr = aptsKey ? (row[aptsKey] || '').trim() : '';

        if (rowEmail === email.trim().toLowerCase() && rowCode === code.trim()) {
          foundUser = true;
          if (rowAptsStr.includes('*(Todos)') || rowAptsStr.toUpperCase() === 'ALL' || rowAptsStr.toUpperCase() === 'ADMIN') {
            isAdmin = true;
          } else {
            // Separar por comas si hay varios apartamentos en una celda
            const apts = rowAptsStr.split(',').map(a => a.trim()).filter(Boolean);
            userApts.push(...apts);
          }
        }
      });

      if (foundUser) {
        onLogin({
          email: email.trim().toLowerCase(),
          allowedApts: isAdmin ? ['ALL'] : userApts,
          isAdmin
        });
      } else {
        setError("Credenciales incorrectas. Revisa tu email y código de acceso.");
      }
    } catch (err) {
      console.error(err);
      setError("Hubo un error al conectar con el servidor de permisos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100%',
      padding: '2rem'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            background: 'rgba(0,120,215,0.1)',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <Lock size={32} color="var(--primary)" />
          </div>
          <h2 className="title-gradient" style={{ margin: 0 }}>Acceso Propietarios</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Introduce tus datos para ver tus reservas
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Email del Propietario
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(255,255,255,0.5)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontSize: '1rem',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Código de Acceso
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(255,255,255,0.5)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontSize: '1rem',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              padding: '0.875rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: loading ? 0.7 : 1,
              marginTop: '0.5rem'
            }}
          >
            {loading ? <Loader size={20} className="animate-spin" /> : 'Entrar'}
          </button>
        </form>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}} />
    </div>
  );
};

export default Login;
