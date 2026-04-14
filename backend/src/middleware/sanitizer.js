// Middleware de Sanitización y Seguridad
// src/middleware/sanitizer.js

const logger = require('../config/logger');

/**
 * Sanitiza strings para prevenir inyecciones
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  return str
    .replace(/[<>]/g, '') // Remover <, >
    .trim()
    .substring(0, 1000); // Limitar longitud
};

/**
 * Sanitiza objetos recursivamente
 */
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
};

/**
 * Middleware para sanitizar request body
 */
const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};

/**
 * Middleware para sanitizar query parameters
 */
const sanitizeQuery = (req, res, next) => {
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  next();
};

/**
 * Middleware para sanitizar params
 */
const sanitizeParams = (req, res, next) => {
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  next();
};

/**
 * Middleware para prevenir inyecciones SQL
 */
const preventSQLInjection = (req, res, next) => {
  const dangerousPatterns = [
    /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)/gi,
    /(['";\\])/g
  ];
  
  const checkString = (str) => {
    if (typeof str !== 'string') return false;
    return dangerousPatterns.some(pattern => pattern.test(str));
  };
  
  // Verificar body
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (checkString(req.body[key])) {
        logger.warn('Potential SQL injection detected in body:', { key, value: req.body[key] });
        return res.status(400).json({
          success: false,
          error: 'Invalid input detected'
        });
      }
    }
  }
  
  next();
};

/**
 * Middleware para prevenir XSS
 */
const preventXSS = (req, res, next) => {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi
  ];
  
  const checkString = (str) => {
    if (typeof str !== 'string') return false;
    return xssPatterns.some(pattern => pattern.test(str));
  };
  
  // Verificar body
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (checkString(req.body[key])) {
        logger.warn('Potential XSS detected in body:', { key });
        return res.status(400).json({
          success: false,
          error: 'Invalid characters detected'
        });
      }
    }
  }
  
  next();
};

/**
 * Sanitizador completo
 */
const sanitize = [
  sanitizeBody,
  sanitizeQuery,
  sanitizeParams,
  preventSQLInjection,
  preventXSS
];

module.exports = {
  sanitizeString,
  sanitizeObject,
  sanitizeBody,
  sanitizeQuery,
  sanitizeParams,
  preventSQLInjection,
  preventXSS,
  sanitize
};
