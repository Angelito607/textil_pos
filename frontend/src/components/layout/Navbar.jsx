import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, Users, History, LogOut, LogIn, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/api$/, '');
  const logoUrl = `${backendBase}/uploads/logo.jpeg`;
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const esInvitado = usuario?.rol === 'invitado';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom">
      <div className="container-fluid">
        <NavLink className="navbar-brand d-flex align-items-center gap-2" to="/">
          <img src={logoUrl} alt="Textil POS" className="brand-logo" />
          <div className="d-none d-md-block">
            <div className="h6 mb-0">Textil POS</div>
            <small className="text-muted">Gestión de ventas y stock</small>
          </div>
        </NavLink>

        <button className="navbar-toggler" type="button" onClick={() => setMenuOpen(!menuOpen)}>
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`} to="/">
                <ShoppingCart size={16} /> Inicio
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`} to="/productos">
                <Package size={16} /> Productos
              </NavLink>
            </li>
            {!esInvitado && (
              <>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`} to="/clientes">
                    <Users size={16} /> Clientes
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`} to="/usuarios">
                    <Users size={16} /> Usuarios
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`} to="/historial">
                    <History size={16} /> Historial
                  </NavLink>
                </li>
              </>
            )}
            {esInvitado && (
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`} to="/mis-compras">
                  <ShoppingBag size={16} /> Mis compras
                </NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2 auth-actions">
            {usuario ? (
              <>
                <span className="badge badge-role">{usuario.usuario} ({usuario.rol})</span>
                <button type="button" className="btn btn-outline-light btn-sm" onClick={async () => { await logout(); navigate('/login'); }}>
                  <LogOut size={16} /> Cerrar sesión
                </button>
              </>
            ) : (
              <button type="button" className="btn btn-outline-light btn-sm" onClick={() => navigate('/login')}>
                <LogIn size={16} /> Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
