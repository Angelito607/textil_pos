const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { getConnection, getMemoryState } = require('../db');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`)
});

const upload = multer({ storage });

router.get('/', async (req, res) => {
  const connection = await getConnection();
  if (!connection) {
    return res.json(getMemoryState().productos);
  }

  try {
    const [rows] = await connection.query('SELECT * FROM productos ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/buscar/:codigo', async (req, res) => {
  const connection = await getConnection();
  if (!connection) {
    const producto = getMemoryState().productos.find((p) => p.codigo === req.params.codigo);
    return producto ? res.json(producto) : res.status(404).json({ message: 'Producto no encontrado' });
  }

  try {
    const [rows] = await connection.query('SELECT * FROM productos WHERE codigo = ?', [req.params.codigo]);
    res.json(rows[0] || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', upload.single('imagen'), async (req, res) => {
  const connection = await getConnection();
  const { codigo, nombre, descripcion, precio, stock, categoria, unidad_medida } = req.body;
  const imagen = req.file ? `/uploads/${req.file.filename}` : null;

  if (!connection) {
    const state = getMemoryState();
    const producto = { id: state.productos.length + 1, codigo, nombre, descripcion, precio, stock, categoria, unidad_medida, imagen };
    state.productos.push(producto);
    return res.status(201).json(producto);
  }

  try {
    const [result] = await connection.query(
      'INSERT INTO productos (codigo, nombre, descripcion, precio, stock, categoria, unidad_medida, imagen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [codigo, nombre, descripcion, precio, stock, categoria, unidad_medida, imagen]
    );
    res.status(201).json({ id: result.insertId, codigo, nombre, descripcion, precio, stock, categoria, unidad_medida, imagen });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', upload.single('imagen'), async (req, res) => {
  const connection = await getConnection();
  const { codigo, nombre, descripcion, precio, stock, categoria, unidad_medida } = req.body;
  const imagen = req.file ? `/uploads/${req.file.filename}` : req.body.imagen;

  if (!connection) {
    const state = getMemoryState();
    const index = state.productos.findIndex((p) => p.id === Number(req.params.id));
    if (index === -1) return res.status(404).json({ message: 'Producto no encontrado' });
    state.productos[index] = { ...state.productos[index], codigo, nombre, descripcion, precio, stock, categoria, unidad_medida, imagen };
    return res.json(state.productos[index]);
  }

  try {
    await connection.query(
      'UPDATE productos SET codigo = ?, nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria = ?, unidad_medida = ?, imagen = ? WHERE id = ?',
      [codigo, nombre, descripcion, precio, stock, categoria, unidad_medida, imagen, req.params.id]
    );
    res.json({ id: req.params.id, codigo, nombre, descripcion, precio, stock, categoria, unidad_medida, imagen });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const connection = await getConnection();

  if (!connection) {
    const state = getMemoryState();
    state.productos = state.productos.filter((p) => p.id !== Number(req.params.id));
    return res.json({ message: 'Producto eliminado' });
  }

  try {
    await connection.query('DELETE FROM productos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
