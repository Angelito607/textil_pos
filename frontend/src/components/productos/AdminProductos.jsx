import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

const emptyForm = { codigo: '', nombre: '', descripcion: '', precio: '', stock: '', categoria: 'telas', unidad_medida: 'metro', imagen: '' };

function AdminProductos() {
  const { usuario } = useAuth();
  const esInvitado = usuario?.rol === 'invitado';
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [imagenFile, setImagenFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const backendBase = api.defaults.baseURL.replace(/\/api$/, '');

  const getImageUrl = (imagen) => {
    if (!imagen) return null;
    if (imagen.startsWith('http')) return imagen;
    return `${backendBase}${imagen}`;
  };

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    const res = await api.get('/productos');
    setProductos(res.data);
  }

  async function guardar(e) {
    e.preventDefault();
    if (esInvitado) return;

    const payload = new FormData();
    payload.append('codigo', form.codigo);
    payload.append('nombre', form.nombre);
    payload.append('descripcion', form.descripcion);
    payload.append('precio', Number(form.precio));
    payload.append('stock', Number(form.stock));
    payload.append('categoria', form.categoria);
    payload.append('unidad_medida', form.unidad_medida);

    if (imagenFile) {
      payload.append('imagen', imagenFile);
    } else if (editingId && form.imagen) {
      payload.append('imagen', form.imagen);
    }

    try {
      if (editingId) {
        await api.put(`/productos/${editingId}`, payload);
        toast.success('Producto actualizado correctamente');
      } else {
        await api.post('/productos', payload);
        toast.success('Producto creado correctamente');
      }
      setForm(emptyForm);
      setImagenFile(null);
      setPreviewUrl(null);
      setEditingId(null);
      setShowForm(false);
      setMensaje('');
      cargar();
    } catch (err) {
      const errorText = err.response?.data?.message || 'Error al guardar el producto';
      setMensaje(errorText);
      toast.error(errorText);
    }
  }

  async function eliminar(id) {
    if (esInvitado) return;
    try {
      await api.delete(`/productos/${id}`);
      toast.success('Producto eliminado');
      cargar();
    } catch (err) {
      const errorText = err.response?.data?.message || 'Error al eliminar el producto';
      toast.error(errorText);
    }
  }

  return (
    <div className="row gy-4">
      <section className="col-12 card card-custom">
        <div className="card-body">
          <div className="section-header">
            <div>
              <h2>Administrar productos</h2>
              <p className="text-muted">Crea, edita y elimina productos desde un panel compacto.</p>
            </div>
            <button type="button" className="btn btn-black btn-sm" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); setImagenFile(null); setPreviewUrl(null); }}>
              {showForm ? 'Ocultar formulario' : 'Crear producto'}
            </button>
          </div>

          <div className={`collapse-card ${showForm ? 'show' : ''}`}>
            <div className="form-panel mb-4">
              <form onSubmit={guardar}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Código</label>
                    <input className="form-control" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Nombre</label>
                    <input className="form-control" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Precio</label>
                    <input className="form-control" type="number" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} required />
                  </div>
                </div>
                <div className="row g-3 mt-2">
                  <div className="col-md-4">
                    <label className="form-label">Stock</label>
                    <input className="form-control" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Categoría</label>
                    <select className="form-select" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                      <option value="telas">Telas</option>
                      <option value="hilos">Hilos</option>
                      <option value="botones">Botones</option>
                      <option value="confeccion">Confección</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Unidad</label>
                    <input className="form-control" value={form.unidad_medida} onChange={(e) => setForm({ ...form, unidad_medida: e.target.value })} />
                  </div>
                </div>
                <div className="row g-3 mt-2">
                  <div className="col-md-12">
                    <label className="form-label">Imagen de producto</label>
                    <input
                      className="form-control"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setImagenFile(file);
                        setPreviewUrl(URL.createObjectURL(file));
                      }}
                    />
                  </div>
                </div>
                {(previewUrl || form.imagen) && (
                  <div className="mt-3">
                    <label className="form-label">Vista previa</label>
                    <img
                      src={previewUrl || getImageUrl(form.imagen)}
                      alt="Preview"
                      className="img-fluid rounded-3"
                      style={{ maxHeight: 220, objectFit: 'cover', width: '100%' }}
                    />
                  </div>
                )}
                <div className="mt-3">
                  <label className="form-label">Descripción</label>
                  <textarea className="form-control" rows="3" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
                </div>
                <div className="mt-3 d-flex flex-wrap gap-2 align-items-center">
                  {!esInvitado ? <button className="btn btn-black" type="submit">{editingId ? 'Actualizar' : 'Guardar'}</button> : <span className="text-muted">Modo solo lectura para invitados.</span>}
                  {mensaje && <div className="alert alert-warning alert-custom mb-0">{mensaje}</div>}
                </div>
              </form>
            </div>
          </div>

          <div>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h3 className="h5 mb-0">Listado de productos</h3>
            </div>
            <div className="table-responsive">
              <table className="table table-hover table-custom align-middle">
                <thead>
                  <tr><th></th><th>Código</th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {productos.map((producto) => (
                    <tr key={producto.id}>
                      <td style={{ width: 72 }}>
                        <img
                        src={producto.imagen ? getImageUrl(producto.imagen) : `https://via.placeholder.com/100x100?text=${encodeURIComponent(producto.nombre)}`}
                        alt={producto.nombre}
                        className="img-fluid rounded"
                        style={{ maxWidth: 72, height: 72, objectFit: 'cover' }}
                      />
                      </td>
                      <td>{producto.codigo}</td>
                      <td>{producto.nombre}</td>
                      <td>${Number(producto.precio).toFixed(2)}</td>
                      <td>{producto.stock}</td>
                      <td>
                        {!esInvitado && (
                          <div className="d-flex gap-2 flex-wrap">
                            <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => {
                              setForm(producto);
                              setEditingId(producto.id);
                              setShowForm(true);
                              setImagenFile(null);
                              setPreviewUrl(getImageUrl(producto.imagen));
                            }}>
                              Editar
                            </button>
                            <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => eliminar(producto.id)}>
                              Eliminar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminProductos;
