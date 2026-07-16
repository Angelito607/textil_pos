import { useMemo } from 'react';
import { ShoppingBag, CalendarDays, CheckCircle } from 'lucide-react';
import { useCompra } from '../../context/CompraContext';

export default function MisCompras() {
  const { compras, carrito, updateQuantity, removeFromCart, clearCart } = useCompra();

  const totalCarrito = useMemo(() => carrito.reduce((acc, item) => acc + item.precio_unitario * item.cantidad, 0), [carrito]);

  return (
    <div className="row gy-4">
      <section className="col-12 col-xl-5 card card-custom">
        <div className="card-body">
          <div className="section-header">
            <div>
              <h2>Mi carrito</h2>
              <p className="text-muted mb-0">Ajusta cantidades o elimina productos antes de finalizar.</p>
            </div>
            <ShoppingBag size={24} className="text-muted" />
          </div>

          {carrito.length === 0 ? (
            <div className="alert alert-secondary">No hay productos en el carrito.</div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {carrito.map((item) => (
                <div key={item.producto_id} className="card card-product p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="mb-1">{item.nombre}</h6>
                      <small className="text-muted">${Number(item.precio_unitario).toFixed(2)} c/u</small>
                    </div>
                    <span className="badge bg-light text-dark">{item.cantidad}</span>
                  </div>
                  <div className="d-flex gap-2 flex-wrap align-items-center">
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => updateQuantity(item.producto_id, -1)}>-</button>
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => updateQuantity(item.producto_id, 1)}>+</button>
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeFromCart(item.producto_id)}>Eliminar</button>
                    <strong className="ms-auto">${(item.precio_unitario * item.cantidad).toFixed(2)}</strong>
                  </div>
                </div>
              ))}
              <div className="total-box p-3 rounded-4 bg-light">
                <div className="d-flex justify-content-between"><span>Total carrito</span><strong>${totalCarrito.toFixed(2)}</strong></div>
              </div>
              <button type="button" className="btn btn-black">Vaciar carrito</button>
            </div>
          )}
        </div>
      </section>

      <section className="col-12 col-xl-7">
        <div className="row row-cols-1 g-3">
          {compras.length === 0 ? (
            <div className="col">
              <div className="card card-custom p-4 text-center">
                <CalendarDays size={32} className="mb-3 text-muted" />
                <h3 className="h5">Sin compras registradas</h3>
                <p className="text-muted">Cuando termines una orden aparecerá aquí con su resumen.</p>
              </div>
            </div>
          ) : (
            compras.map((compra, index) => (
              <div key={index} className="col">
                <div className="card card-product p-3">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="mb-1">Compra {compras.length - index}</h5>
                      <small className="text-muted">{new Date(compra.fecha).toLocaleString()}</small>
                    </div>
                    <span className="badge bg-success text-white d-flex align-items-center gap-1">
                      <CheckCircle size={14} /> Entregado
                    </span>
                  </div>
                  <div className="d-flex flex-column gap-2 mb-3">
                    {compra.items.map((item) => (
                      <div key={item.producto_id} className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{item.nombre}</strong>
                          <div className="text-muted small">{item.cantidad} x ${Number(item.precio_unitario).toFixed(2)}</div>
                        </div>
                        <span>${(item.precio_unitario * item.cantidad).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="total-box p-3 rounded-4 bg-light">
                    <div className="d-flex justify-content-between"><span>Total</span><strong>${Number(compra.total).toFixed(2)}</strong></div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
