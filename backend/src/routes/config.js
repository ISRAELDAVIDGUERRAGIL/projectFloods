// Ruta de Configuración - COMPLETA
// src/routes/config.js

const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const ConfigService = require('../services/ConfigService');
const logger = require('../config/logger');

// GET /api/config - Obtener configuración
router.get('/', auth, [
  query('deviceId').notEmpty()
], async (req, res) => {
  try {
    const { deviceId } = req.query;

    const config = await ConfigService.getConfig(deviceId);

    res.json({
      success: true,
      config
    });
  } catch (err) {
    logger.error('Error getting config:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  }
});

// PUT /api/config - Actualizar configuración
router.put('/', auth, authorize('ADMIN', 'OPERADOR'), [
  body('deviceId').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { deviceId, ...configData } = req.body;

    // Remover campos no configurables
    delete configData.success;
    delete configData.error;

    const config = await ConfigService.updateConfig(deviceId, configData, req.user.id);

    res.json({
      success: true,
      config,
      message: 'Configuration updated'
    });
  } catch (err) {
    logger.error('Error updating config:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  }
});

module.exports = router;
