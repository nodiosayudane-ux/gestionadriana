import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const [session, setSession] = useState(() => {
    return localStorage.getItem('user_session') === 'active';
  });
  
  const [theme, setTheme] = useState(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const handleLoginSuccess = () => {
    localStorage.setItem('user_session', 'active');
    setSession(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    setSession(false);
  };

  // Apply theme class to body
  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.className = newTheme === 'dark' ? 'dark-theme' : 'light-theme';
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!session ? <Login onLoginSuccess={handleLoginSuccess} theme={theme} toggleTheme={toggleTheme} /> : <Navigate to="/dashboard" replace />} 
        />
        <Route 
          path="/dashboard/*" 
          element={session ? <Dashboard onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} /> : <Navigate to="/login" replace />} 
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
