const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const memoryState = {
  productos: [],
  clientes: [],
  ventas: [],
  detalleVentas: []
};

let pool = null;
let sqliteDb = null;

async function initSqlite(dbPath) {
  if (sqliteDb) return sqliteDb;
  await fs.promises.mkdir(path.dirname(dbPath), { recursive: true });
  sqliteDb = await open({ filename: dbPath, driver: sqlite3.Database });
  await sqliteDb.exec('PRAGMA foreign_keys = ON;');
  await ensureSqliteSchema(sqliteDb);
  return sqliteDb;
}

async function ensureSqliteSchema(db) {
  await db.exec(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'invitado',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`);

  await db.exec(`CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    categoria TEXT,
    unidad_medida TEXT,
    imagen TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`);

  await db.exec(`CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    telefono TEXT,
    email TEXT,
    direccion TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`);

  await db.exec(`CREATE TABLE IF NOT EXISTS ventas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER,
    total REAL NOT NULL,
    metodo_pago TEXT NOT NULL,
    fecha TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
  );`);

  await db.exec(`CREATE TABLE IF NOT EXISTS detalle_ventas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venta_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario REAL NOT NULL,
    subtotal REAL NOT NULL,
    FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
  );`);

  await db.exec('CREATE INDEX IF NOT EXISTS idx_productos_codigo ON productos(codigo);');
  await db.exec('CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha);');
  await db.exec('CREATE INDEX IF NOT EXISTS idx_ventas_cliente ON ventas(cliente_id);');

  await migrateUsuariosTableIfNeeded(db);
}

async function migrateUsuariosTableIfNeeded(db) {
  const info = await db.all("PRAGMA table_info('usuarios')");
  if (!Array.isArray(info) || info.length === 0) return;

  const idColumn = info.find(column => column.name === 'id');
  if (idColumn && idColumn.pk === 1 && idColumn.type.toUpperCase() === 'INTEGER') return;

  console.warn('Migrando tabla usuarios a esquema SQLite con id AUTOINCREMENT');
  console.warn('Esquema previo de usuarios:', JSON.stringify(info));

  await db.exec('PRAGMA foreign_keys = OFF;');
  await db.exec('BEGIN TRANSACTION;');
  await db.exec('ALTER TABLE usuarios RENAME TO usuarios_old;');
  await db.exec(`CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'invitado',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`);
  await db.exec('INSERT INTO usuarios (usuario, password_hash, rol, created_at) SELECT usuario, password_hash, rol, created_at FROM usuarios_old;');
  await db.exec('DROP TABLE usuarios_old;');
  await db.exec('COMMIT;');
  await db.exec('PRAGMA foreign_keys = ON;');

  const migratedInfo = await db.all("PRAGMA table_info('usuarios')");
  console.warn('Esquema migrado de usuarios:', JSON.stringify(migratedInfo));
}

async function getConnection() {
  if (pool) return pool;

  const config = {
    host: process.env.DB_HOST || '',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'textil_pos'
  };

  // Try MySQL first if DB_HOST provided
  if (process.env.DB_HOST) {
    try {
      pool = await mysql.createConnection({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database
      });
      console.log('Conexión a MySQL lista');
      return pool;
    } catch (error) {
      console.warn('MySQL no disponible, intentando SQLite fallback:', error.message);
    }
  }

  // Fallback to sqlite file
  try {
    const dbFile = process.env.SQLITE_FILE || path.join(__dirname, 'database', 'textil_pos.sqlite');
    const db = await initSqlite(dbFile);

    // Provide a mysql-like interface used by routes: connection.query(sql, params)
    const sqliteConn = {
      query: async (sql, params = []) => {
        const s = sql.trim().toUpperCase();
        if (s.startsWith('SELECT') || s.startsWith('PRAGMA')) {
          const rows = await db.all(sql, params);
          return [rows, []];
        }

        // run for INSERT/UPDATE/DELETE
        const result = await db.run(sql, params);
        return [{ insertId: result.lastID, affectedRows: result.changes }];
      }
    };

    console.log('Usando SQLite como backend en', dbFile);
    return sqliteConn;
  } catch (err) {
    console.warn('No se pudo inicializar SQLite:', err.message);
    return null;
  }
}

function getMemoryState() {
  return memoryState;
}

module.exports = { getConnection, getMemoryState };
