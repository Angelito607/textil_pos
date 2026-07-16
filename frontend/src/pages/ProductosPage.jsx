import { useAuth } from '../context/AuthContext';
import AdminProductos from '../components/productos/AdminProductos';
import ProductosCliente from '../components/productos/ProductosCliente';

export default function ProductosPage() {
  const { usuario } = useAuth();
  const esInvitado = usuario?.rol === 'invitado';

  return esInvitado ? <ProductosCliente /> : <AdminProductos />;
}
