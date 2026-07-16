const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  'https://textil-pos.vercel.app',
  'https://textil-ag7iego6i-angel67.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Textil POS API funcionando' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/ventas', require('./routes/ventas'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/usuarios', require('./routes/usuarios'));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Ensure admin user exists on startup
const bcrypt = require('bcrypt');
const { getConnection } = require('./db');

async function ensureAdminUser() {
  const user = process.env.ADMIN_USER || 'admin';
  const pass = process.env.ADMIN_PASS || 'Admin123!';
  try {
    const connection = await getConnection();
    if (!connection) {
      console.warn('No DB connection available to create admin user.');
      return;
    }

    const [rows] = await connection.query('SELECT id FROM usuarios WHERE usuario = ?', [user]);
    const exists = Array.isArray(rows) ? rows.length > 0 : false;
    if (!exists) {
      const hash = await bcrypt.hash(pass, 10);
      await connection.query('INSERT INTO usuarios (usuario, password_hash, rol) VALUES (?, ?, ?)', [user, hash, 'admin']);
      console.log(`Usuario admin creado: ${user}`);
    } else {
      console.log(`Usuario admin ya existe: ${user}`);
    }
  } catch (err) {
    console.error('Error asegurando usuario admin:', err.message);
  }
}

// Run after small delay to ensure server is ready
setTimeout(() => { ensureAdminUser(); }, 1000);