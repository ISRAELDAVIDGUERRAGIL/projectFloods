// Validadores Centralizados
// src/middleware/validators.js

const { body, param, query, validationResult } = require('express-validator');
const logger = require('../config/logger');

/**
 * Middleware para manejar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.warn('Validation errors:', { errors: errors.array() });
    
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

/**
 * VALIDADORES DE AUTENTICACIÓN
 */
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

const validateRegister = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('Password must contain letters and numbers'),
  body('full_name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 3 }).withMessage('Full name must be at least 3 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]{7,}$/).withMessage('Invalid phone number'),
  handleValidationErrors
];

/**
 * VALIDADORES DE DISPOSITIVOS
 */
const validateCreateDevice = [
  body('location')
    .trim()
    .notEmpty().withMessage('Location is required')
    .isLength({ min: 3, max: 100 }).withMessage('Location must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('device_id')
    .optional()
    .trim()
    .matches(/^[A-Za-z0-9\-_]+$/).withMessage('Device ID can only contain alphanumeric characters, hyphens, and underscores'),
  body('threshold_alert')
    .optional()
    .isFloat({ min: 0, max: 500 }).withMessage('Threshold alert must be between 0 and 500'),
  body('threshold_danger')
    .optional()
    .isFloat({ min: 0, max: 500 }).withMessage('Threshold danger must be between 0 and 500'),
  handleValidationErrors
];

const validateUpdateDevice = [
  param('deviceId')
    .trim()
    .notEmpty().withMessage('Device ID is required'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Location must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['ACTIVO', 'INACTIVO', 'MANTENIMIENTO']).withMessage('Invalid status'),
  handleValidationErrors
];

const validateDeviceId = [
  param('deviceId')
    .trim()
    .notEmpty().withMessage('Device ID is required'),
  handleValidationErrors
];

/**
 * VALIDADORES DE MEDICIONES
 */
const validateCreateMeasurement = [
  body('device_id')
    .trim()
    .notEmpty().withMessage('Device ID is required'),
  body('water_level')
    .isFloat({ min: 0, max: 1000 }).withMessage('Water level must be between 0 and 1000 cm'),
  body('distance')
    .optional()
    .isFloat({ min: 0, max: 1000 }).withMessage('Distance must be between 0 and 1000 cm'),
  body('temperature')
    .optional()
    .isFloat({ min: -50, max: 150 }).withMessage('Temperature must be between -50 and 150°C'),
  body('humidity')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Humidity must be between 0 and 100%'),
  body('battery')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Battery must be between 0 and 100%'),
  handleValidationErrors
];

const validateMeasurementQuery = [
  query('deviceId')
    .trim()
    .notEmpty().withMessage('Device ID is required'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
  query('offset')
    .optional()
    .isInt({ min: 0 }).withMessage('Offset must be greater than or equal to 0'),
  query('startDate')
    .optional()
    .isISO8601().withMessage('Invalid start date format'),
  query('endDate')
    .optional()
    .isISO8601().withMessage('Invalid end date format'),
  handleValidationErrors
];

/**
 * VALIDADORES DE ALERTAS
 */
const validateCreateAlert = [
  body('device_id')
    .trim()
    .notEmpty().withMessage('Device ID is required'),
  body('state')
    .isIn(['NORMAL', 'ALERTA', 'PELIGRO']).withMessage('Invalid alert state'),
  body('water_level')
    .isFloat({ min: 0, max: 1000 }).withMessage('Water level must be between 0 and 1000'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  handleValidationErrors
];

const validateAlertQuery = [
  query('deviceId')
    .optional()
    .trim(),
  query('state')
    .optional()
    .isIn(['NORMAL', 'ALERTA', 'PELIGRO']).withMessage('Invalid state filter'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
  query('offset')
    .optional()
    .isInt({ min: 0 }).withMessage('Offset must be greater than or equal to 0'),
  handleValidationErrors
];

/**
 * VALIDADORES DE CONFIGURACIÓN
 */
const validateUpdateConfig = [
  param('deviceId')
    .trim()
    .notEmpty().withMessage('Device ID is required'),
  body('threshold_alert')
    .optional()
    .isFloat({ min: 0, max: 500 }).withMessage('Threshold alert must be between 0 and 500'),
  body('threshold_danger')
    .optional()
    .isFloat({ min: 0, max: 500 }).withMessage('Threshold danger must be between 0 and 500'),
  body('update_interval')
    .optional()
    .isInt({ min: 5, max: 3600 }).withMessage('Update interval must be between 5 and 3600 seconds'),
  body('notification_enabled')
    .optional()
    .isBoolean().withMessage('Notification enabled must be boolean'),
  handleValidationErrors
];

/**
 * VALIDADORES DE USUARIOS
 */
const validateCreateUser = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('full_name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 3 }).withMessage('Full name must be at least 3 characters'),
  body('phone')
    .optional()
    .trim(),
  body('role')
    .optional()
    .isIn(['ADMIN', 'OPERADOR', 'VISUALIZADOR']).withMessage('Invalid role'),
  handleValidationErrors
];

const validateUpdateUser = [
  param('userId')
    .trim()
    .isInt().withMessage('Invalid user ID'),
  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 3 }).withMessage('Full name must be at least 3 characters'),
  body('phone')
    .optional()
    .trim(),
  body('role')
    .optional()
    .isIn(['ADMIN', 'OPERADOR', 'VISUALIZADOR']).withMessage('Invalid role'),
  handleValidationErrors
];

/**
 * VALIDADORES DE QUERY PARAMS COMUNES
 */
const validatePagination = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000')
    .toInt(),
  query('offset')
    .optional()
    .isInt({ min: 0 }).withMessage('Offset must be >= 0')
    .toInt(),
  handleValidationErrors
];

module.exports = {
  // Middleware
  handleValidationErrors,
  
  // Auth validators
  validateLogin,
  validateRegister,
  
  // Device validators
  validateCreateDevice,
  validateUpdateDevice,
  validateDeviceId,
  
  // Measurement validators
  validateCreateMeasurement,
  validateMeasurementQuery,
  
  // Alert validators
  validateCreateAlert,
  validateAlertQuery,
  
  // Config validators
  validateUpdateConfig,
  
  // User validators
  validateCreateUser,
  validateUpdateUser,
  
  // Common validators
  validatePagination
};
