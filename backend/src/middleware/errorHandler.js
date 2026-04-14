// Manejador Global de Errores
// src/middleware/errorHandler.js

const logger = require('../config/logger');

/**
 * Clase personalizada para errores de aplicación
 */
class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Middleware de captura de excepciones async
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware global de manejo de errores
 */
const errorHandler = (err, req, res, next) => {
  // Log del error
  logger.error('Error occurred:', {
    message: err.message,
    statusCode: err.statusCode || 500,
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorType = err.name || 'Error';

  // Diferentes tipos de errores
  if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Service Unavailable - Database connection error';
    errorType = 'DatabaseError';
  }

  if (err.code === 'ER_DUP_ENTRY' || err.code === '23505') {
    statusCode = 409;
    message = 'Conflict - Record already exists';
    errorType = 'DuplicateError';
  }

  if (err.code === '22P02' || err.code === 'ER_TRUNCATED_WRONG_VALUE') {
    statusCode = 400;
    message = 'Invalid data format';
    errorType = 'ValidationError';
  }

  if (err.code === '42P01' || err.code === 'ER_NO_REFERENCED_ROW') {
    statusCode = 404;
    message = 'Record not found';
    errorType = 'NotFoundError';
  }

  // JASONWebTokenError
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    errorType = 'AuthenticationError';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    errorType = 'AuthenticationError';
  }

  // Respuesta de error
  const errorResponse = {
    success: false,
    error: message,
    errorType: errorType,
    timestamp: new Date().toISOString(),
    ...(err.details && { details: err.details }),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      originalError: err.message
    })
  };

  // En desarrollo, incluir más info
  if (process.env.NODE_ENV === 'development') {
    errorResponse.debug = {
      method: req.method,
      path: req.path,
      ...(req.body && { body: req.body })
    };
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Middleware para capturar rutas no encontradas
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    {
      method: req.method,
      path: req.path
    }
  );
  next(error);
};

module.exports = {
  AppError,
  asyncHandler,
  errorHandler,
  notFoundHandler
};
