import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [modoRegistro, setModoRegistro] = useState(false);
  const [cliente, setCliente] = useState({ usuario: '', password: '', nombre: '', telefono: '', email: '', direccion: '' });
  const [registroMensaje, setRegistroMensaje] = useState('');

  const iniciarSesion = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await login(usuario, password);
      navigate('/');
    } catch (err) {
      setError('Usuario o contraseña incorrectos');
    }
  };

  const registrarCliente = async (e) => {
    e.preventDefault();
    try {
      setRegistroMensaje('');
      await api.post('/auth/register', cliente);
      setRegistroMensaje('Registro de cliente exitoso. Ahora puedes iniciar sesión con tu usuario y contraseña.');
      setCliente({ usuario: '', password: '', nombre: '', telefono: '', email: '', direccion: '' });
      setModoRegistro(false);
    } catch (err) {
      setRegistroMensaje(err.response?.data?.message || 'Error en el registro de cliente');
    }
  };

  return (
    <div className="card" style={{ maxWidth: 520, margin: '70px auto', padding: 24 }}>
      <h2>{modoRegistro ? 'Registro de cliente' : 'Iniciar sesión'}</h2>
      {!modoRegistro ? (
        <>
          <form onSubmit={iniciarSesion} style={{ display: 'grid', gap: 12 }}>
            <input className="input" value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="Usuario" required />
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" required />
            <button className="btn btn-primary" type="submit">Entrar</button>
          </form>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <hr />
          <p>¿Aún no tienes usuario?</p>
          <button className="btn btn-secondary" onClick={() => setModoRegistro(true)}>
            Registrar como cliente
          </button>
        </>
      ) : (
        <>
          <form onSubmit={registrarCliente} style={{ display: 'grid', gap: 12 }}>
            <input className="input" value={cliente.usuario} onChange={(e) => setCliente({ ...cliente, usuario: e.target.value })} placeholder="Usuario" required />
            <input className="input" type="password" value={cliente.password} onChange={(e) => setCliente({ ...cliente, password: e.target.value })} placeholder="Contraseña" required />
            <input className="input" value={cliente.nombre} onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })} placeholder="Nombre" required />
            <input className="input" value={cliente.telefono} onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })} placeholder="Teléfono" required />
            <input className="input" type="email" value={cliente.email} onChange={(e) => setCliente({ ...cliente, email: e.target.value })} placeholder="Email" required />
            <textarea className="textarea" rows={4} value={cliente.direccion} onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })} placeholder="Dirección" required />
            <button className="btn btn-primary" type="submit">Registrar cliente</button>
          </form>
          {registroMensaje && <p style={{ color: 'green' }}>{registroMensaje}</p>}
          <button className="btn btn-link" onClick={() => setModoRegistro(false)}>
            Volver al login
          </button>
        </>
      )}
    </div>
  );
}

export default LoginPage;
