// Base de Datos - Conexión MySQL Nativa
// src/config/database.js

const mysql = require('mysql2/promise');
const logger = require('./logger');

let pool;

if (process.env.MYSQL_URL || process.env.DATABASE_URL) {
  const connectionString = process.env.MYSQL_URL || process.env.DATABASE_URL;
  pool = mysql.createPool({
    uri: connectionString,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
  });
} else {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'iot_inundaciones',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
  });
}

// Probar conexión inicial
pool.getConnection()
  .then(connection => {
    logger.info('MySQL Pool connected successfully.');
    connection.release();
  })
  .catch(err => {
    logger.error('Error connecting to MySQL', err);
  });

// Función de compatibilidad para evitar reescribir todos los servicios desde cero.
// Como el proyecto originalmente fue diseñado para PostgreSQL/engañado, algunos servicios pueden esperar la prop 'rows'.
// También mysql2 usa placeholders '?' por defecto, así que no necesitamos hacer transformaciones complejas.
async function query(text, params) {
  const start = Date.now();

  try {
    // Si la query viene configurada para Postgres (con $1, $2, o RETURNING id), 
    // intentamos limpiarla para que MySQL la acepte usando expresiones regulares simples
    let mysqlText = text;
    if (mysqlText && mysqlText.includes('$')) {
        mysqlText = mysqlText.replace(/\$\d+/g, '?');
    }
    
    // Quitar RETURNING id que es propio de Postgres
    if (mysqlText && mysqlText.toUpperCase().includes('RETURNING ID')) {
        mysqlText = mysqlText.replace(/RETURNING id/gi, '');
    }

    const [rows, fields] = await pool.execute(mysqlText, params);
    const duration = Date.now() - start;
    logger.debug(`Executed MySQL query in ${duration}ms`);
    
    // Simulamos la respuesta tipo Postgres para que los servicios no se rompan, 
    // pero también incluimos el insertId nativo de MySQL.
    return {
      rows: Array.isArray(rows) ? rows : [],
      insertId: rows.insertId ? rows.insertId : null,
      affectedRows: rows.affectedRows
    };
  } catch (err) {
    logger.error('Database query error:', err);
    throw err;
  }
}

async function getClient() {
  const client = await pool.getConnection();
  const originalQuery = client.query.bind(client);
  const originalExecute = client.execute.bind(client);
  
  // Envolvemos query para el getClient
  client.query = async (text, params) => {
    let mysqlText = text;
    if (mysqlText && mysqlText.includes('$')) {
        mysqlText = mysqlText.replace(/\$\d+/g, '?');
    }
    if (mysqlText && mysqlText.toUpperCase().includes('RETURNING ID')) {
        mysqlText = mysqlText.replace(/RETURNING id/gi, '');
    }
    const [rows] = await originalExecute(mysqlText, params);
    return {
      rows: Array.isArray(rows) ? rows : [],
      insertId: rows.insertId ? rows.insertId : null,
      affectedRows: rows.affectedRows
    };
  };
  
  return client;
}

module.exports = {
  query,
  getClient,
  pool
};
