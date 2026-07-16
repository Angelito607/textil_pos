function validarStock(req, res, next) {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'La venta debe incluir productos.' });
  }

  const { getMemoryState } = require('../db');
  const state = getMemoryState();

  for (const item of items) {
    const producto = state.productos.find((p) => p.id === Number(item.producto_id));
    if (!producto) {
      return res.status(404).json({ message: `Producto ${item.producto_id} no encontrado.` });
    }
    if (producto.stock < Number(item.cantidad)) {
      return res.status(400).json({ message: `Stock insuficiente para ${producto.nombre}.` });
    }
  }

  next();
}

module.exports = validarStock;
