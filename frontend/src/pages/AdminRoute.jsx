import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <div style={{ padding: 24 }}>Cargando...</div>;
  }

  if (!usuario || usuario.rol !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
