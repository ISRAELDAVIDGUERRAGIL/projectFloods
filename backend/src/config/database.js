// Base de Datos - Conexión MySQL
// src/config/database.js

const mysql = require('mysql2/promise');
const logger = require('./logger');

let pool;

if (process.env.MYSQL_URL) {
  // Conexión principal usando URL (ideal para Railway)
  pool = mysql.createPool(process.env.MYSQL_URL);
} else {
  // Conexión fallback usando variables desagregadas
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'iot_inundaciones',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

pool.getConnection()
  .then(conn => {
    logger.info('MySQL Pool connected successfully.');
    conn.release();
  })
  .catch(err => {
    logger.error('Error connecting to MySQL:', err);
  });

async function query(text, params) {
  const start = Date.now();
  try {
    const [rows] = await pool.execute(text, params);
    const duration = Date.now() - start;
    logger.debug(`Executed query in ${duration}ms`);
    
    const isArray = Array.isArray(rows);
    return {
      rows: isArray ? rows : [],
      insertId: !isArray ? rows.insertId : null,
      affectedRows: !isArray ? rows.affectedRows : null
    };
  } catch (err) {
    logger.error('Database query error:', err);
    throw err;
  }
}

async function getClient() {
  const client = await pool.getConnection();
  const originalExecute = client.execute.bind(client);
  
  client.query = async (text, params) => {
    const [rows] = await originalExecute(text, params);
    const isArray = Array.isArray(rows);
    return {
      rows: isArray ? rows : [],
      insertId: !isArray ? rows.insertId : null,
      affectedRows: !isArray ? rows.affectedRows : null
    };
  };
  
  return client;
}

module.exports = {
  query,
  getClient,
  pool
};
