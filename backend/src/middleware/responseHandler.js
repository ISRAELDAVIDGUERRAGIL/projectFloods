// Respuestas Estandarizadas
// src/middleware/responseHandler.js

const logger = require('../config/logger');

/**
 * Estructura estándar de respuesta exitosa
 */
const successResponse = (data, message = 'Success', statusCode = 200) => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

/**
 * Estructura estándar de respuesta de error
 */
const errorResponse = (error, statusCode = 500, details = null) => {
  return {
    success: false,
    error: error || 'Internal Server Error',
    statusCode,
    ...(details && { details }),
    timestamp: new Date().toISOString()
  };
};

/**
 * Middleware para agregar helpers de respuesta al objeto res
 */
const responseHandler = (req, res, next) => {
  // Respuesta exitosa
  res.success = (data, message = 'Success', statusCode = 200) => {
    logger.info(`Success response - ${statusCode}: ${message}`);
    res.status(statusCode).json(successResponse(data, message, statusCode));
  };

  // Respuesta de error
  res.error = (error, statusCode = 500, details = null) => {
    logger.error(`Error response - ${statusCode}: ${error}`, { details });
    res.status(statusCode).json(errorResponse(error, statusCode, details));
  };

  // Respuesta de validación
  res.validationError = (details) => {
    logger.warn('Validation error', { details });
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      statusCode: 400,
      details,
      timestamp: new Date().toISOString()
    });
  };

  // Respuesta no autorizado
  res.unauthorized = (message = 'Unauthorized') => {
    logger.warn(`Unauthorized: ${message}`);
    res.status(401).json(errorResponse(message, 401));
  };

  // Respuesta prohibido
  res.forbidden = (message = 'Forbidden') => {
    logger.warn(`Forbidden: ${message}`);
    res.status(403).json(errorResponse(message, 403));
  };

  // Respuesta no encontrado
  res.notFound = (resource, details = null) => {
    const message = `${resource || 'Resource'} not found`;
    logger.warn(`Not found: ${message}`);
    res.status(404).json(errorResponse(message, 404, details));
  };

  // Respuesta conflicto
  res.conflict = (message = 'Conflict', details = null) => {
    logger.warn(`Conflict: ${message}`);
    res.status(409).json(errorResponse(message, 409, details));
  };

  // Respuesta paginada
  res.paginated = (data, total, limit = 20, offset = 0, message = 'Success') => {
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.floor(offset / limit) + 1;
    
    res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        total,
        limit,
        offset,
        page: currentPage,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
      },
      timestamp: new Date().toISOString()
    });
  };

  next();
};

/**
 * Middleware para capturar estado HTTP
 */
const statusMessage = (statusCode) => {
  const messages = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    500: 'Internal Server Error',
    503: 'Service Unavailable'
  };
  
  return messages[statusCode] || 'Unknown';
};

module.exports = {
  responseHandler,
  successResponse,
  errorResponse,
  statusMessage
};
