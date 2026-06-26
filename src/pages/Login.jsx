import { useState } from 'react';
import { LogIn, Moon, Sun } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './Login.css';

function Login({ onLoginSuccess, theme, toggleTheme }) {
  const [email, setEmail] = useState('adriana@gestion.com');
  const [password, setPassword] = useState('1234');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    // Consulta a nuestra propia tabla de usuarios
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error || !data) {
      setErrorMsg('Credenciales incorrectas');
    } else {
      onLoginSuccess();
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
          {errorMsg && <p style={{color: 'var(--ios-red)', fontSize: '14px', textAlign: 'center'}}>{errorMsg}</p>}
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
            {loading ? 'Entrando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
