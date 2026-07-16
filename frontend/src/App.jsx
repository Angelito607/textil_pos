import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import PantallaCobro from './components/ventas/PantallaCobro';
import ProductosPage from './pages/ProductosPage';
import ClientesLista from './components/clientes/ClientesLista';
import HistorialVentas from './components/historial/HistorialVentas';
import AdminUsuarios from './components/usuarios/AdminUsuarios';
import MisComprasPage from './pages/MisComprasPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './pages/ProtectedRoute';
import AdminRoute from './pages/AdminRoute';
import ClienteRoute from './pages/ClienteRoute';

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="content container-fluid px-4 py-4">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/cobro" element={<ProtectedRoute><PantallaCobro /></ProtectedRoute>} />
          <Route path="/productos" element={<ProtectedRoute><ProductosPage /></ProtectedRoute>} />
          <Route path="/clientes" element={<AdminRoute><ClientesLista /></AdminRoute>} />
          <Route path="/usuarios" element={<AdminRoute><AdminUsuarios /></AdminRoute>} />
          <Route path="/historial" element={<AdminRoute><HistorialVentas /></AdminRoute>} />
          <Route path="/mis-compras" element={<ClienteRoute><MisComprasPage /></ClienteRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
