import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

function ClientesLista() {
  const { usuario } = useAuth();
  const esInvitado = usuario?.rol === 'invitado';
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', direccion: '' });
  const [showForm, setShowForm] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    const res = await api.get('/clientes');
    setClientes(res.data);
  }

  async function guardar(e) {
    e.preventDefault();
    if (esInvitado) return;
    try {
      await api.post('/clientes', form);
      toast.success('Cliente registrado correctamente');
      setForm({ nombre: '', telefono: '', email: '', direccion: '' });
      setMensaje('');
      setShowForm(false);
      cargar();
    } catch (err) {
      const errorText = err.response?.data?.message || 'Error al registrar cliente';
      setMensaje(errorText);
      toast.error(errorText);
    }
  }

  return (
    <div className="row gy-4">
      <section className="col-12 card card-custom">
        <div className="card-body">
          <div className="section-header">
            <div>
              <h2>Clientes</h2>
              <p className="text-muted">Administra clientes en un panel compacto y accesible.</p>
            </div>
            {!esInvitado && (
              <button type="button" className="btn btn-black btn-sm" onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Ocultar formulario' : 'Crear cliente'}
              </button>
            )}
          </div>

          <div className={`collapse-card ${showForm ? 'show' : ''}`}>
            <div className="form-panel mb-4">
              <form onSubmit={guardar}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Nombre</label>
                    <input className="form-control" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Teléfono</label>
                    <input className="form-control" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input className="form-control" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Dirección</label>
                    <input className="form-control" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
                  </div>
                </div>
                <div className="mt-3">
                  <button className="btn btn-black" type="submit">Registrar</button>
                  {mensaje && <div className="alert alert-warning alert-custom mt-3">{mensaje}</div>}
                </div>
              </form>
            </div>
          </div>

          {esInvitado && <div className="alert alert-secondary">Acceso de solo consulta para invitados.</div>}

          <div>
            <div className="table-responsive">
              <table className="table table-hover table-custom align-middle">
                <thead>
                  <tr><th>Nombre</th><th>Teléfono</th><th>Email</th></tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <tr key={cliente.id}><td>{cliente.nombre}</td><td>{cliente.telefono}</td><td>{cliente.email}</td></tr>
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

export default ClientesLista;
