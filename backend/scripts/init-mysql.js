// scripts/init-mysql.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function initDB() {
  console.log('Iniciando volcado de Base de Datos hacia Railway...');
  
  if (!process.env.MYSQL_URL) {
    console.error('ERROR: No se encontró MYSQL_URL en tu archivo .env');
    process.exit(1);
  }

  try {
    // Necesitamos multipleStatements: true para correr todo el .sql de golpe
    const connection = await mysql.createConnection({
      uri: process.env.MYSQL_URL,
      multipleStatements: true
    });

    const sqlFilePath = path.join(__dirname, '..', '..', 'database', 'init.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Ejecutando script init.sql en la nube. ¡Por favor espera!... 🚀');
    
    await connection.query(sql);
    
    console.log('✅ ¡BINGO! Base de datos inicializada exitosamente en Railway.');
    console.log('Ya puedes ir a ver tus tablas en Railway o iniciar sesión en Vercel.');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error inyectando las tablas en Railway:', error.message);
  }
}

initDB();
