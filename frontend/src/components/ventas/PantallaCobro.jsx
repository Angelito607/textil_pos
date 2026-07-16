import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, Receipt } from 'lucide-react';
import api from '../../api';
import { useCompra } from '../../context/CompraContext';

function PantallaCobro() {
  const [productos, setProductos] = useState([]);
  const [codigo, setCodigo] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [clientes, setClientes] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const { carrito, addToCart, updateQuantity, removeFromCart, clearCart, addCompra } = useCompra();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [productosRes, clientesRes] = await Promise.all([api.get('/productos'), api.get('/clientes')]);
      setProductos(productosRes.data);
      setClientes(clientesRes.data);
    } catch (error) {
      console.error(error);
    }
  }

  const total = useMemo(() => carrito.reduce((acc, item) => acc + item.precio_unitario * item.cantidad, 0), [carrito]);
  const cambio = useMemo(() => (montoRecibido ? Number(montoRecibido) - total : 0), [montoRecibido, total]);

  const agregarProducto = (producto) => {
    addToCart(producto);
    setMensaje(`${producto.nombre} agregado al carrito`);
  };

  const buscarPorCodigo = async (e) => {
    e.preventDefault();
    if (!codigo.trim()) return;
    try {
      const res = await api.get(`/productos/buscar/${codigo}`);
      if (res.data) agregarProducto(res.data);
      else setMensaje('Producto no encontrado');
    } catch (error) {
      setMensaje('No se pudo buscar el producto');
    }
  };

  const actualizarCantidad = (id, delta) => {
    updateQuantity(id, delta);
  };

  const eliminarProducto = (id) => {
    removeFromCart(id);
  };

  const confirmarVenta = async () => {
    if (!carrito.length) {
      setMensaje('Agrega productos antes de confirmar');
      return;
    }

    try {
      const payload = { cliente_id: clienteId || null, metodo_pago: metodoPago, items: carrito, monto_recibido: montoRecibido || 0 };
      const res = await api.post('/ventas', payload);
      setMensaje(`Venta registrada con ID ${res.data.id}`);
      addCompra({ items: carrito, total, metodo_pago: metodoPago, fecha: new Date().toISOString() });
      clearCart();
      setMontoRecibido('');
      setCodigo('');
      fetchData();
    } catch (error) {
      setMensaje(error.response?.data?.message || 'No se pudo registrar la venta');
    }
  };

  return (
    <div className="row gy-4">
      <section className="col-12 col-xl-7 card card-custom">
        <div className="card-body">
          <div className="section-header">
            <div>
              <h2>Punto de venta</h2>
              <p className="text-muted">Agrega productos al carrito y completa la venta en un solo flujo.</p>
            </div>
            <span className="badge bg-secondary text-white rounded-pill">Mostrador</span>
          </div>

          <form className="row g-3 align-items-end" onSubmit={buscarPorCodigo}>
            <div className="col-md-9">
              <label className="form-label">Buscar por código</label>
              <input autoFocus className="form-control" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ej. TEL-001" />
            </div>
            <div className="col-md-3 d-grid">
              <button className="btn btn-black" type="submit"><Search size={16} /> Buscar</button>
            </div>
          </form>

          <div className="mt-4">
            <h3 className="h5 mb-3">Catálogo rápido</h3>
            <div className="row row-cols-1 row-cols-md-2 g-3">
              {productos.map((producto) => (
                <div key={producto.id} className="col">
                  <div className="product-card">
                    <div className="badge">{producto.categoria || 'general'}</div>
                    <h4>{producto.nombre}</h4>
                    <p className="text-muted mb-2">{producto.descripcion}</p>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <strong>${Number(producto.precio).toFixed(2)}</strong>
                      <span className="text-muted">Stock: {producto.stock}</span>
                    </div>
                    <button className="btn btn-outline-dark w-100" onClick={() => agregarProducto(producto)}>
                      <Plus size={16} /> Agregar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <aside className="col-12 col-xl-5 card card-custom">
        <div className="card-body">
          <div className="section-header">
            <div>
              <h2>Carrito</h2>
              <p className="text-muted">Revisa los productos antes de confirmar la venta.</p>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Cliente (opcional)</label>
            <select className="form-select" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
              <option value="">Sin cliente</option>
              {clientes.map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>)}
            </select>
          </div>

          <div className="mb-3">
            {carrito.length === 0 ? <p className="text-muted">El carrito está vacío.</p> : carrito.map((item) => (
              <div key={item.producto_id} className="p-3 mb-2 bg-light rounded-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="mb-1">{item.nombre}</h6>
                    <small className="text-muted">${Number(item.precio_unitario).toFixed(2)} c/u</small>
                  </div>
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => eliminarProducto(item.producto_id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="d-flex gap-2 align-items-center">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => actualizarCantidad(item.producto_id, -1)}><Minus size={14} /></button>
                  <span className="fw-semibold">{item.cantidad}</span>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => actualizarCantidad(item.producto_id, 1)}><Plus size={14} /></button>
                </div>
              </div>
            ))}
          </div>

          <div className="card card-body bg-white border rounded-4 mb-3">
            <div className="d-flex justify-content-between mb-3"><span>Total</span><strong>${total.toFixed(2)}</strong></div>
            <label className="form-label">Método de pago</label>
            <select className="form-select mb-3" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
              <option value="otro">Otro</option>
            </select>
            {metodoPago === 'efectivo' && (
              <>
                <label className="form-label">Monto recibido</label>
                <input className="form-control mb-3" type="number" value={montoRecibido} onChange={(e) => setMontoRecibido(e.target.value)} />
                <div className="d-flex justify-content-between text-muted"><span>Cambio</span><strong>${cambio.toFixed(2)}</strong></div>
              </>
            )}
          </div>

          <button className="btn btn-black w-100" onClick={confirmarVenta}>
            <Receipt size={16} /> Confirmar venta
          </button>
          {mensaje && <div className="alert alert-info alert-custom mt-3">{mensaje}</div>}
        </div>
      </aside>
    </div>
  );
}

export default PantallaCobro;
