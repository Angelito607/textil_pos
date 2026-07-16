import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api';
import { login as loginApi, me as meApi } from '../api/auth.api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }

    const verificar = async () => {
      if (!token) {
        setUsuario(null);
        setCargando(false);
        return;
      }

      try {
        const datos = await meApi();
        setUsuario(datos);
      } catch (error) {
        setUsuario(null);
        setToken(null);
        localStorage.removeItem('token');
      } finally {
        setCargando(false);
      }
    };

    verificar();
  }, [token]);

  const login = async (usuarioLogin, password) => {
    const data = await loginApi({ usuario: usuarioLogin, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUsuario({ usuario: data.usuario, rol: data.rol });
  };

  const logout = async () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common.Authorization;
  };

  const value = useMemo(
    () => ({ usuario, token, cargando, login, logout }),
    [usuario, token, cargando]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
