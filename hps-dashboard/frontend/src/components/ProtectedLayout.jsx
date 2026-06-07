import { useAuth } from '../hooks/useAuth';

export default function ProtectedLayout({ children }) {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (!usuario) {
    window.location.href = '/login';
    return null;
  }

  return <>{children}</>;
}