import { useState } from 'react';
import { LogIn, Moon, Sun, UserPlus } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './Login.css';

function Login({ theme, toggleTheme }) {
  const [email, setEmail] = useState('adriana@gestion.com');
  const [password, setPassword] = useState('Adriana2026Secure!');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErrorMsg(error.message);
    setLoading(false);
  };

  const handleRegister = async () => {
    setLoading(true);
    setErrorMsg('');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setErrorMsg(error.message);
    } else {
      alert("Usuario creado exitosamente. Ahora puedes iniciar sesión.");
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box glass">
        
        <div style={{ position: 'absolute', top: 20, right: 20 }}>
          <button onClick={toggleTheme} className="theme-toggle-btn">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="login-header">
          <div className="avatar-placeholder">
            <LogIn size={40} color="var(--ios-blue)" />
          </div>
          <h2>Dra. Adriana</h2>
          <p>Sistema de Gestión</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          {errorMsg && <p style={{color: 'var(--ios-red)', fontSize: '14px'}}>{errorMsg}</p>}
          <div className="input-group">
            <input 
              type="email" 
              placeholder="Correo electrónico" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <button 
            type="button" 
            onClick={handleRegister}
            disabled={loading}
            style={{ 
                marginTop: '20px', 
                background: 'none', 
                border: 'none', 
                color: 'var(--ios-blue)', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                margin: '20px auto 0' 
            }}
        >
          <UserPlus size={16} /> Crear cuenta
        </button>
      </div>
    </div>
  );
}

export default Login;
