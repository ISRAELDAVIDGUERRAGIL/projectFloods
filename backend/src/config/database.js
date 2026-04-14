// Base de Datos - Conexión PostgreSQL (Supabase)
// src/config/database.js

const { Pool } = require('pg');
const logger = require('./logger');

let pool;

if (process.env.DATABASE_URL || process.env.SUPABASE_URL || process.env.MYSQL_URL) {
  // Conexión a Supabase Cloud
  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_URL || process.env.MYSQL_URL;
  pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false } // Requerido por Supabase y muchas nubes
  });
} else {
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'iot_inundaciones',
    port: process.env.DB_PORT || 5432,
  });
}

pool.on('connect', () => {
  logger.info('Supabase PostgreSQL Pool connected successfully.');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
});

// Función de compatibilidad para evitar reescribir todos los servicios desde cero
async function query(text, params) {
  const start = Date.now();
  
  // Transformar placeholders '?' (MySQL) a '$1, $2' (Postgres) al vuelo
  let pgText = text;
  if (pgText && pgText.includes('?')) {
    let paramIndex = 1;
    pgText = pgText.replace(/\?/g, () => `$${paramIndex++}`);
  }

  // Auto-inyección de RETURNING id para los INSERTS si no lo tienen
  if (pgText.toUpperCase().trim().startsWith('INSERT') && !pgText.toUpperCase().includes('RETURNING')) {
    pgText = pgText + ' RETURNING id';
  }

  try {
    const res = await pool.query(pgText, params);
    const duration = Date.now() - start;
    logger.debug(`Executed query in ${duration}ms`);
    
    // Simular el insertId de MySQL usando el id que nos devuelve Postgres con RETURNING
    return {
      rows: res.rows,
      insertId: res.rows.length > 0 ? res.rows[0].id : null,
      affectedRows: res.rowCount
    };
  } catch (err) {
    logger.error('Database query error:', err);
    throw err;
  }
}

async function getClient() {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  
  client.query = async (text, params) => {
    let pgText = text;
    if (pgText && pgText.includes('?')) {
      let paramIndex = 1;
      pgText = pgText.replace(/\?/g, () => `$${paramIndex++}`);
    }
    if (pgText.toUpperCase().trim().startsWith('INSERT') && !pgText.toUpperCase().includes('RETURNING')) {
      pgText = pgText + ' RETURNING id';
    }
    const res = await originalQuery(pgText, params);
    return {
      rows: res.rows,
      insertId: res.rows.length > 0 ? res.rows[0].id : null,
      affectedRows: res.rowCount
    };
  };
  
  return client;
}

module.exports = {
  query,
  getClient,
  pool
};
