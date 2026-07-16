import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ClienteRoute({ children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <div style={{ padding: 24 }}>Cargando...</div>;
  }

  if (!usuario || usuario.rol !== 'invitado') {
    return <Navigate to="/" replace />;
  }

  return children;
}
