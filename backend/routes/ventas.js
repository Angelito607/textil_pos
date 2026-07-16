const express = require('express');
const router = express.Router();
const { getConnection, getMemoryState } = require('../db');
const validarStock = require('../middleware/validarStock');

router.post('/', validarStock, async (req, res) => {
  const connection = await getConnection();
  const { cliente_id, metodo_pago, items, monto_recibido } = req.body;
  const total = items.reduce((acc, item) => acc + Number(item.precio_unitario) * Number(item.cantidad), 0);

  if (!connection) {
    const state = getMemoryState();
    const venta = {
      id: state.ventas.length + 1,
      cliente_id: cliente_id || null,
      total,
      metodo_pago,
      fecha: new Date().toISOString(),
      items
    };
    state.ventas.push(venta);
    state.productos = state.productos.map((producto) => {
      const item = items.find((i) => i.producto_id === producto.id);
      if (item) producto.stock = producto.stock - Number(item.cantidad);
      return producto;
    });
    return res.status(201).json({ venta, cambio: monto_recibido ? Number(monto_recibido) - total : 0 });
  }

  try {
    const [ventaResult] = await connection.query('INSERT INTO ventas (cliente_id, total, metodo_pago) VALUES (?, ?, ?)', [cliente_id || null, total, metodo_pago]);
    const ventaId = ventaResult.insertId;

    for (const item of items) {
      await connection.query('INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)', [ventaId, item.producto_id, item.cantidad, item.precio_unitario, Number(item.precio_unitario) * Number(item.cantidad)]);
      await connection.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [item.cantidad, item.producto_id]);
    }

    res.status(201).json({ id: ventaId, total, metodo_pago, items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  const connection = await getConnection();
  if (!connection) {
    return res.json(getMemoryState().ventas);
  }

  try {
    const [rows] = await connection.query('SELECT * FROM ventas ORDER BY fecha DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/detalle', async (req, res) => {
  const connection = await getConnection();
  if (!connection) {
    const venta = getMemoryState().ventas.find((v) => v.id === Number(req.params.id));
    return venta ? res.json(venta) : res.status(404).json({ message: 'Venta no encontrada' });
  }

  try {
    const [rows] = await connection.query('SELECT * FROM detalle_ventas WHERE venta_id = ?', [req.params.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
