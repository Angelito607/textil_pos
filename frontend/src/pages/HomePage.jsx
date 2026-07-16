import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Package, Users, UserCheck, Clock, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/api$/, '');
  const logoUrl = `${backendBase}/uploads/logo.jpeg`;
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const esInvitado = usuario?.rol === 'invitado';

  const cards = esInvitado
    ? [
        { title: 'Ver productos', subtitle: 'Explora el catálogo disponible', icon: Package, action: () => navigate('/productos') },
        { title: 'Mis compras', subtitle: 'Revisa tu historial de pedidos', icon: ShoppingBag, action: () => navigate('/mis-compras') },
      ]
    : [
        { title: 'Productos', subtitle: 'Agregar o editar stock', icon: Package, action: () => navigate('/productos') },
        { title: 'Clientes', subtitle: 'Gestiona tu base de clientes', icon: Users, action: () => navigate('/clientes') },
        { title: 'Usuarios', subtitle: 'Administra accesos y roles', icon: UserCheck, action: () => navigate('/usuarios') },
        { title: 'Historial', subtitle: 'Revisa las ventas recientes', icon: Clock, action: () => navigate('/historial') },
      ];

  return (
    <div className="row gy-4">
      <section className="col-12 text-center">
        <div className="home-brand mb-4">
          <img src={logoUrl} alt="Textil POS" className="home-logo mb-3" />
          <h1 className="mb-1">Textil POS</h1>
          <p className="text-muted mb-0">Diseño · Calidad · Pasión</p>
        </div>
      </section>
      <section className="col-12 card card-custom">
        <div className="card-body">
          <div className="section-header">
            <div>
              <h1 className="mb-1">Bienvenido, {usuario?.usuario}</h1>
              <p className="text-muted mb-0">
                {esInvitado
                  ? 'Como cliente puedes ver productos, agregar al carrito y revisar tus compras con rapidez.'
                  : 'Como administrador puedes gestionar productos, clientes, usuarios y ver el historial de ventas.'}
              </p>
            </div>
            <div className="badge bg-black text-white rounded-pill px-3 py-2">{esInvitado ? 'Cliente' : 'Administrador'}</div>
          </div>
        </div>
      </section>

      <section className="col-12">
        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-3">
          {cards.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="col">
                <button type="button" className="card card-menu h-100 text-start" onClick={item.action}>
                  <div className="card-body d-flex align-items-start gap-3">
                    <div className="menu-icon bg-black text-white rounded-4 d-flex align-items-center justify-content-center">
                      <Icon size={22} />
                    </div>
                    <div>
                      <h5 className="mb-1">{item.title}</h5>
                      <p className="text-muted mb-0">{item.subtitle}</p>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {!esInvitado && (
        <section className="col-12 card card-custom">
          <div className="card-body">
            <h3 className="mb-3">Atajos rápidos</h3>
            <div className="row row-cols-1 row-cols-sm-2 g-3">
              <button className="btn btn-outline-dark rounded-4 py-3" onClick={() => navigate('/cobro')}>
                <Home size={18} className="me-2" /> Punto de venta
              </button>
              <button className="btn btn-outline-dark rounded-4 py-3" onClick={() => navigate('/productos')}>
                <Package size={18} className="me-2" /> Productos
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
