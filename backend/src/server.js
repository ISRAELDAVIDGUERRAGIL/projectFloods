// Servidor Principal - Sistema IoT Inundaciones FUNCIONAL
// src/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./config/logger');
const db = require('./config/database');

const app = express();

// ===== MIDDLEWARES =====

// CORS
app.use(cors({
  origin: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
  credentials: true
}));

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Request validator
app.use((req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    logger.debug(`Request body: ${JSON.stringify(req.body).substring(0, 200)}`);
  }
  next();
});

// ===== RUTAS =====

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/measurements', require('./routes/measurements'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/devices', require('./routes/devices'));
app.use('/api/config', require('./routes/config'));
app.use('/api/users', require('./routes/users'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/simulator', require('./routes/simulator'));

// ===== 404 HANDLER =====

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// ===== ERROR HANDLER =====

app.use((err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ===== INICIAR SERVIDOR =====

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

const server = app.listen(PORT, HOST, () => {
  logger.info('╔════════════════════════════════════════════════════════════╗');
  logger.info('║         SERVIDOR IOT INUNDACIONES INICIADO                 ║');
  logger.info('╚════════════════════════════════════════════════════════════╝');
  logger.info(`🚀 Servidor corriendo en: http://${HOST}:${PORT}`);
  logger.info(`📊 Health check: http://${HOST}:${PORT}/health`);
  logger.info(`📚 API Base: http://${HOST}:${PORT}/api`);
  logger.info('');
  logger.info('Endpoints disponibles:');
  logger.info('  POST   /api/auth/login');
  logger.info('  POST   /api/auth/register');
  logger.info('  POST   /api/measurements');
  logger.info('  GET    /api/measurements/latest');
  logger.info('  GET    /api/measurements');
  logger.info('  GET    /api/alerts');
  logger.info('  POST   /api/alerts/trigger-alarm');
  logger.info('  GET    /api/devices');
  logger.info('  POST   /api/devices');
  logger.info('  GET    /api/analytics/stats');
  logger.info('');
});

// ===== GRACEFUL SHUTDOWN =====

process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido. Cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT recibido. Cerrando servidor...');
  server.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
});

module.exports = app;
