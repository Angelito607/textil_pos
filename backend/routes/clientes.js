const express = require('express');
const router = express.Router();
const { getConnection, getMemoryState } = require('../db');

router.get('/', async (req, res) => {
  const connection = await getConnection();
  if (!connection) {
    return res.json(getMemoryState().clientes);
  }

  try {
    const [rows] = await connection.query('SELECT * FROM clientes ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  const connection = await getConnection();
  const { nombre, telefono, email, direccion } = req.body;

  if (!connection) {
    const state = getMemoryState();
    const cliente = { id: state.clientes.length + 1, nombre, telefono, email, direccion };
    state.clientes.push(cliente);
    return res.status(201).json(cliente);
  }

  try {
    const [result] = await connection.query('INSERT INTO clientes (nombre, telefono, email, direccion) VALUES (?, ?, ?, ?)', [nombre, telefono, email, direccion]);
    res.status(201).json({ id: result.insertId, nombre, telefono, email, direccion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/ventas', async (req, res) => {
  const connection = await getConnection();
  if (!connection) {
    const ventas = getMemoryState().ventas.filter((v) => v.cliente_id === Number(req.params.id));
    return res.json(ventas);
  }

  try {
    const [rows] = await connection.query('SELECT * FROM ventas WHERE cliente_id = ? ORDER BY fecha DESC', [req.params.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
