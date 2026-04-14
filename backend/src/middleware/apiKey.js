// Middleware de Validación API Key
// src/middleware/apiKey.js

const logger = require('../config/logger');

const apiKey = (req, res, next) => {
  try {
    // Obtener API Key del header
    const key = req.headers['x-api-key'];
    
    if (!key) {
      return res.status(401).json({
        success: false,
        error: 'API key required'
      });
    }

    // Validar API Key (en producción, buscar en BD)
    const validKey = process.env.API_KEY || 'sk_live_default';
    
    if (key !== validKey) {
      logger.warn(`Invalid API key attempt: ${key}`);
      return res.status(403).json({
        success: false,
        error: 'Invalid API key'
      });
    }

    next();
  } catch (err) {
    logger.error('API Key middleware error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = apiKey;
