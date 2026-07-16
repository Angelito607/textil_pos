const express = require('express');
const bcrypt = require('bcrypt');
const { getConnection, getMemoryState } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', async (req, res) => {
  const { usuario, password, rol } = req.body;
  const password_hash = await bcrypt.hash(password, 10);
  const connection = await getConnection();

  if (!connection) {
    const state = getMemoryState();
    const user = { id: state.usuarios.length + 1, usuario, password_hash, rol: rol || 'invitado' };
    state.usuarios.push(user);
    return res.status(201).json({ id: user.id, usuario: user.usuario, rol: user.rol });
  }

  try {
    const [result] = await connection.query(
      'INSERT INTO usuarios (usuario, password_hash, rol) VALUES (?, ?, ?)',
      [usuario, password_hash, rol || 'invitado']
    );
    res.status(201).json({ id: result.insertId, usuario, rol: rol || 'invitado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  const connection = await getConnection();
  if (!connection) {
    return res.json(getMemoryState().usuarios.map(({ password_hash, ...user }) => user));
  }

  try {
    const [rows] = await connection.query('SELECT id, usuario, rol, created_at FROM usuarios ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
