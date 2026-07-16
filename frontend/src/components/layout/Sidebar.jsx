import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <NavLink to="/">Cobro</NavLink>
      <NavLink to="/productos">Productos</NavLink>
      <NavLink to="/clientes">Clientes</NavLink>
      <NavLink to="/usuarios">Usuarios</NavLink>
      <NavLink to="/historial">Historial</NavLink>
    </aside>
  );
}
