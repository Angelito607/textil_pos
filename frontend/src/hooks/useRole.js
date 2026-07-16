import { useAuth } from '../context/AuthContext';

export function useRole() {
  const { usuario } = useAuth();
  return usuario?.rol || 'invitado';
}
