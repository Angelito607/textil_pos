import { useEffect, useState } from 'react';
import api from '../../api';
import { format } from 'date-fns';

function HistorialVentas() {
  const [ventas, setVentas] = useState([]);
  const [detalle, setDetalle] = useState(null);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    const res = await api.get('/ventas');
    setVentas(res.data);
  }

  async function verDetalle(id) {
    const res = await api.get(`/ventas/${id}/detalle`);
    setDetalle(res.data);
  }

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Historial de ventas</h2>
      <table className="table">
        <thead>
          <tr><th>ID</th><th>Fecha</th><th>Método</th><th>Total</th><th></th></tr>
        </thead>
        <tbody>
          {ventas.map((venta) => (
            <tr key={venta.id}>
              <td>{venta.id}</td>
              <td>{venta.fecha ? format(new Date(venta.fecha), 'dd/MM/yyyy HH:mm') : '-'}</td>
              <td>{venta.metodo_pago}</td>
              <td>${Number(venta.total).toFixed(2)}</td>
              <td><button className="btn btn-secondary" onClick={() => verDetalle(venta.id)}>Detalle</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {detalle && (
        <div className="total-box" style={{ marginTop: '1rem' }}>
          <h3>Detalle</h3>
          {detalle.map((item) => <div key={item.id} className="venta-item"><span>Producto #{item.producto_id}</span><span>Cant: {item.cantidad}</span><span>${Number(item.subtotal).toFixed(2)}</span></div>)}
        </div>
      )}
    </div>
  );
}

export default HistorialVentas;
