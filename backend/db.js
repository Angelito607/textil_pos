const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const memoryState = {
  productos: [
    { id: 1, codigo: 'TEL-001', nombre: 'Tela algodón', descripcion: 'Tela ligera para confección', precio: 120.5, stock: 18, categoria: 'telas', unidad_medida: 'metro', imagen: 'https://via.placeholder.com/420x260?text=Tela+algod%C3%B3n' },
    { id: 2, codigo: 'HIL-001', nombre: 'Hilo poliéster', descripcion: 'Hilo resistente para bordado', precio: 24, stock: 46, categoria: 'hilos', unidad_medida: 'rollo', imagen: 'https://via.placeholder.com/420x260?text=Hilo+poli%C3%A9ster' },
    { id: 3, codigo: 'BTN-001', nombre: 'Botón metálico', descripcion: 'Botón de acabado premium', precio: 3.5, stock: 120, categoria: 'botones', unidad_medida: 'pieza', imagen: 'https://via.placeholder.com/420x260?text=Bot%C3%B3n+met%C3%A1lico' }
  ],
  clientes: [
    { id: 1, nombre: 'María López', telefono: '5551234', email: 'maria@example.com', direccion: 'Av. Principal 123' }
  ],
  ventas: [],
  detalleVentas: []
};

let pool = null;

async function getConnection() {
  if (pool) return pool;

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'textil_pos',
    waitForConnections: true,
    connectionLimit: 10
  };

  try {
    pool = await mysql.createConnection(config);
    console.log('Conexión a MySQL lista');
    return pool;
  } catch (error) {
    console.warn('MySQL no disponible, usando almacenamiento en memoria:', error.message);
    return null;
  }
}

function getMemoryState() {
  return memoryState;
}

module.exports = { getConnection, getMemoryState };
