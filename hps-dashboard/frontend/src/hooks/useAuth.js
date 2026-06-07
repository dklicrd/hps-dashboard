import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('hps_usuario');
    const token = localStorage.getItem('hps_token');
    if (stored && token) {
      setUsuario(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await authAPI.login(username, password);
    const { token, usuario: user } = res.data;
    localStorage.setItem('hps_token', token);
    localStorage.setItem('hps_usuario', JSON.stringify(user));
    setUsuario(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('hps_token');
    localStorage.removeItem('hps_usuario');
    setUsuario(null);
  };

  const esAdmin = usuario?.rol === 'admin';

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout, esAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}