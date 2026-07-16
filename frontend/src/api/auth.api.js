import api from '../api';

export const login = async (datos) => {
  const res = await api.post('/auth/login', datos);
  return res.data;
};

export const me = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

export const logout = async () => {
  const res = await api.post('/auth/logout');
  return res.data;
};
