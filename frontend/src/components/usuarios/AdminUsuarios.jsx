import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

function AdminUsuarios() {
  const { usuario } = useAuth();
  const esInvitado = usuario?.rol === 'invitado';
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({ usuario: '', password: '', rol: 'invitado' });
  const [showForm, setShowForm] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    try {
      const res = await api.get('/usuarios');
      setUsuarios(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function guardar(e) {
    e.preventDefault();
    if (esInvitado) return;
    try {
      await api.post('/usuarios', form);
      toast.success('Usuario creado correctamente');
      setForm({ usuario: '', password: '', rol: 'invitado' });
      setMensaje('');
      setShowForm(false);
      cargar();
    } catch (err) {
      const errorText = err.response?.data?.message || 'Error al crear usuario';
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
              <h2>Administrar usuarios</h2>
              <p className="text-muted">Crear y listar usuarios del sistema desde un solo panel.</p>
            </div>
            {!esInvitado && (
              <button type="button" className="btn btn-black btn-sm" onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Ocultar formulario' : 'Crear usuario'}
              </button>
            )}
          </div>

          <div className={`collapse-card ${showForm ? 'show' : ''}`}>
            <div className="form-panel mb-4">
              <form onSubmit={guardar} className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Usuario</label>
                  <input className="form-control" placeholder="Usuario" value={form.usuario} onChange={(e) => setForm({ ...form, usuario: e.target.value })} required disabled={esInvitado} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Contraseña</label>
                  <input className="form-control" type="password" placeholder="Contraseña" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required disabled={esInvitado} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Rol</label>
                  <select className="form-select" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })} disabled={esInvitado}>
                    <option value="invitado">Invitado</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="col-12 d-flex gap-2 align-items-center">
                  <button className="btn btn-black" type="submit">Crear usuario</button>
                  {mensaje && <div className="alert alert-warning alert-custom mb-0">{mensaje}</div>}
                </div>
              </form>
            </div>
          </div>

          {esInvitado && <div className="alert alert-secondary">Acceso de solo consulta para invitados.</div>}

          <div className="table-responsive">
            <table className="table table-hover table-custom align-middle">
              <thead><tr><th>ID</th><th>Usuario</th><th>Rol</th></tr></thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id}><td>{u.id}</td><td>{u.usuario}</td><td>{u.rol}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminUsuarios;
