import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import api from '../../api';
import { useCompra } from '../../context/CompraContext';

function ProductosCliente() {
  const { addToCart } = useCompra();
  const [productos, setProductos] = useState([]);
  const backendBase = api.defaults.baseURL.replace(/\/api$/, '');

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    const res = await api.get('/productos');
    setProductos(res.data);
  }

  return (
    <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
      {productos.map((producto) => {
        const imageUrl = producto.imagen ? `${backendBase}${producto.imagen}` : `https://via.placeholder.com/420x260.png?text=${encodeURIComponent(producto.nombre || 'Producto')}`;
        return (
          <div key={producto.id} className="col">
            <div className="card card-product h-100 shadow-sm">
              <img src={imageUrl} alt={producto.nombre} className="product-card-image" />
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="card-title mb-1">{producto.nombre}</h5>
                    <p className="text-muted mb-1 text-truncate">{producto.descripcion || 'Descripción breve del producto'}</p>
                  </div>
                  <span className="badge bg-dark text-white rounded-pill">{producto.categoria || 'General'}</span>
                </div>
                <div className="mb-3">
                  <strong className="d-block mb-1">${Number(producto.precio).toFixed(2)}</strong>
                  <small className="text-muted">Stock: {producto.stock}</small>
                </div>
                <button type="button" className="btn btn-black mt-auto d-flex align-items-center justify-content-center gap-2" onClick={() => addToCart(producto)}>
                  <ShoppingCart size={16} /> Agregar
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ProductosCliente;
