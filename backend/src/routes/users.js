// Ruta de Usuarios (Admin) - COMPLETA
// src/routes/users.js

const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const UserService = require('../services/UserService');
const logger = require('../config/logger');

// GET /api/users - Listar usuarios (Admin)
router.get('/', auth, authorize('ADMIN'), [
  query('limit').optional().isInt(),
  query('offset').optional().isInt()
], async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await UserService.getUsers(parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: result.data,
      total: result.total,
      limit: result.limit,
      offset: result.offset
    });
  } catch (err) {
    logger.error('Error getting users:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  }
});

// POST /api/users - Crear usuario (Admin)
router.post('/', auth, authorize('ADMIN'), [
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  body('full_name').notEmpty(),
  body('phone').optional(),
  body('role').optional().isIn(['ADMIN', 'OPERADOR', 'VISUALIZADOR'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user = await UserService.createUser(req.body, req.user.id);

    res.status(201).json({
      success: true,
      user
    });
  } catch (err) {
    logger.error('Error creating user:', err);
    const statusCode = err.message === 'Email already exists' ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  }
});

module.exports = router;
