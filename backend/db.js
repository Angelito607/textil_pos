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
  return sqliteDb;
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
