import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-[#00897b]">
      <div className="bg-white rounded-2xl p-10 shadow-2xl w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-primary">
            DIVISIÓN ARBOLEDA<br />HPS-IMPORT
          </h2>
          <p className="text-xs text-gray-500 mt-1">Dashboard Integral de Rentabilidad 2026</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 bg-gray-50"
              autoFocus
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 bg-gray-50"
            />
          </div>

          {error && (
            <p className="text-red-600 text-xs text-center mb-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-full font-semibold text-sm hover:bg-primary-light transition-colors disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-5">
          Invitado: invitado / invitado
        </p>
      </div>
    </div>
  );
}