const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');
const { getConnection, getMemoryState } = require('../db');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { usuario, password } = req.body;
  const connection = await getConnection();
  let user;

  if (connection) {
    const [rows] = await connection.query('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);
    user = rows[0];
  } else {
    const state = getMemoryState();
    const usuarios = state.usuarios || [];
    user = usuarios.find((u) => u.usuario === usuario);
  }

  if (!user) {
    return res.status(401).json({ message: 'Credenciales incorrectas' });
  }

  const coincide = await bcrypt.compare(password, user.password_hash);
  if (!coincide) {
    return res.status(401).json({ message: 'Credenciales incorrectas' });
  }

  const token = jwt.sign(
    { id: user.id, usuario: user.usuario, rol: user.rol },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '8h' }
  );

  res.json({ token, usuario: user.usuario, rol: user.rol });
});

router.get('/me', authMiddleware(), async (req, res) => {
  res.json({ id: req.usuario.id, usuario: req.usuario.usuario, rol: req.usuario.rol });
});

router.post('/register', async (req, res) => {
  const { usuario, password, nombre, telefono, email, direccion } = req.body;
  if (!usuario || !password || !nombre || !telefono || !email || !direccion) {
    return res.status(400).json({ message: 'Faltan datos requeridos para el registro.' });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const connection = await getConnection();

  if (!connection) {
    const state = getMemoryState();
    state.usuarios = state.usuarios || [];
    state.clientes = state.clientes || [];

    const existeUsuario = state.usuarios.some((u) => u.usuario === usuario);
    if (existeUsuario) {
      return res.status(400).json({ message: 'El usuario ya existe.' });
    }

    const cliente = { id: state.clientes.length + 1, nombre, telefono, email, direccion };
    state.clientes.push(cliente);

    const user = { id: state.usuarios.length + 1, usuario, password_hash, rol: 'invitado' };
    state.usuarios.push(user);

    return res.status(201).json({ message: 'Cliente e invitado registrados correctamente.', usuario: user.usuario, cliente });
  }

  try {
    const [existing] = await connection.query('SELECT id FROM usuarios WHERE usuario = ?', [usuario]);
    if (existing.length) {
      return res.status(400).json({ message: 'El usuario ya existe.' });
    }

    const [clienteResult] = await connection.query(
      'INSERT INTO clientes (nombre, telefono, email, direccion) VALUES (?, ?, ?, ?)',
      [nombre, telefono, email, direccion]
    );

    const [userResult] = await connection.query(
      'INSERT INTO usuarios (usuario, password_hash, rol) VALUES (?, ?, ?)',
      [usuario, password_hash, 'invitado']
    );

    res.status(201).json({
      message: 'Cliente e invitado registrados correctamente.',
      usuario: { id: userResult.insertId, usuario, rol: 'invitado' },
      cliente: { id: clienteResult.insertId, nombre, telefono, email, direccion }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/logout', authMiddleware(), async (req, res) => {
  res.json({ message: 'Logout exitoso' });
});

module.exports = router;
