import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const CompraContext = createContext();

export const useCompra = () => useContext(CompraContext);

export function CompraProvider({ children }) {
  const { usuario } = useAuth();
  const [carrito, setCarrito] = useState([]);
  const [compras, setCompras] = useState([]);

  useEffect(() => {
    if (!usuario) {
      setCarrito([]);
      setCompras([]);
      return;
    }

    const carritoGuardado = localStorage.getItem(`carrito_${usuario.usuario}`);
    const comprasGuardadas = localStorage.getItem(`compras_${usuario.usuario}`);

    setCarrito(carritoGuardado ? JSON.parse(carritoGuardado) : []);
    setCompras(comprasGuardadas ? JSON.parse(comprasGuardadas) : []);
  }, [usuario]);

  useEffect(() => {
    if (!usuario) return;
    localStorage.setItem(`carrito_${usuario.usuario}`, JSON.stringify(carrito));
  }, [carrito, usuario]);

  useEffect(() => {
    if (!usuario) return;
    localStorage.setItem(`compras_${usuario.usuario}`, JSON.stringify(compras));
  }, [compras, usuario]);

  const addToCart = (producto) => {
    setCarrito((prev) => {
      const existing = prev.find((item) => item.producto_id === producto.id);
      if (existing) {
        return prev.map((item) => item.producto_id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, {
        producto_id: producto.id,
        nombre: producto.nombre,
        precio_unitario: Number(producto.precio),
        cantidad: 1,
      }];
    });
  };

  const updateQuantity = (producto_id, delta) => {
    setCarrito((prev) => prev.flatMap((item) => {
      if (item.producto_id !== producto_id) return [item];
      const nextQty = item.cantidad + delta;
      return nextQty > 0 ? [{ ...item, cantidad: nextQty }] : [];
    }));
  };

  const removeFromCart = (producto_id) => {
    setCarrito((prev) => prev.filter((item) => item.producto_id !== producto_id));
  };

  const clearCart = () => setCarrito([]);

  const addCompra = (compra) => {
    setCompras((prev) => [{ ...compra, fecha: compra.fecha || new Date().toISOString() }, ...prev]);
  };

  const value = useMemo(
    () => ({ carrito, compras, addToCart, updateQuantity, removeFromCart, clearCart, addCompra }),
    [carrito, compras]
  );

  return <CompraContext.Provider value={value}>{children}</CompraContext.Provider>;
}
