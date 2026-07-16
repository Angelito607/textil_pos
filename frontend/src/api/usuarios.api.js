import api from '../api';

export const listarUsuarios = () => api.get('/usuarios');
export const crearUsuario = (datos) => api.post('/usuarios', datos);
export const eliminarUsuario = (id) => api.delete(`/usuarios/${id}`);

export default { listarUsuarios, crearUsuario, eliminarUsuario };
