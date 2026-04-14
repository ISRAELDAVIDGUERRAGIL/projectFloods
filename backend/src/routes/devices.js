// Ruta de Dispositivos - COMPLETA
// src/routes/devices.js

const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const DeviceService = require('../services/DeviceService');
const logger = require('../config/logger');

// GET /api/devices - Obtener dispositivos del usuario
router.get('/', auth, async (req, res) => {
  try {
    const devices = await DeviceService.getUserDevices(req.user.id);

    res.json({
      success: true,
      devices
    });
  } catch (err) {
    logger.error('Error getting devices:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  }
});

// POST /api/devices - Registrar dispositivo
router.post('/', auth, [
  body('device_id').optional().trim(),
  body('location').notEmpty(),
  body('description').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const device = await DeviceService.registerDevice(req.user.id, req.body);
    const apiKey = await DeviceService.generateApiKey(device.device_id);

    res.status(201).json({
      success: true,
      device,
      apiKey
    });
  } catch (err) {
    logger.error('Error registering device:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  }
});

// GET /api/devices/:deviceId - Obtener dispositivo
router.get('/:deviceId', auth, async (req, res) => {
  try {
    const device = await DeviceService.getDevice(req.params.deviceId);

    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found'
      });
    }

    res.json({
      success: true,
      device
    });
  } catch (err) {
    logger.error('Error getting device:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  }
});

// PUT /api/devices/:deviceId - Actualizar dispositivo
router.put('/:deviceId', auth, [
  param('deviceId').notEmpty(),
  body('location').optional(),
  body('description').optional(),
  body('status').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const device = await DeviceService.updateDevice(req.params.deviceId, req.body);

    res.json({
      success: true,
      device
    });
  } catch (err) {
    logger.error('Error updating device:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  }
});

// DELETE /api/devices/:deviceId - Eliminar dispositivo
router.delete('/:deviceId', auth, async (req, res) => {
  try {
    await DeviceService.deleteDevice(req.params.deviceId, req.user.id);

    res.json({
      success: true,
      message: 'Device deleted'
    });
  } catch (err) {
    logger.error('Error deleting device:', err);
    const statusCode = err.message === 'Unauthorized' ? 403 : 500;
    res.status(statusCode).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  }
});

module.exports = router;
