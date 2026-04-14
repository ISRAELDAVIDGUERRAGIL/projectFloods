// Ruta de Mediciones - COMPLETA
// src/routes/measurements.js

const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const apiKey = require('../middleware/apiKey');
const MeasurementService = require('../services/MeasurementService');
const AlertService = require('../services/AlertService');
const ConfigService = require('../services/ConfigService');
const logger = require('../config/logger');

// POST /api/measurements - Enviar medición (ESP32)
router.post('/', apiKey, [
  body('deviceId').notEmpty().trim(),
  body('distance').isFloat({ min: 0, max: 400 }),
  body('tankHeight').optional().isFloat(),
  body('temperature').optional().isFloat(),
  body('battery').optional().isInt({ min: 0, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { deviceId, distance, temperature, battery, tankHeight = 100 } = req.body;

    // Obtener configuración del dispositivo
    const config = await ConfigService.getConfig(deviceId);
    const normalLevel = config.NORMAL_LEVEL || 30;
    const alertLevel = config.ALERT_LEVEL || 60;

    // Calcular nivel de agua y estado
    const waterLevel = tankHeight - distance;
    let state = 'NORMAL';

    if (waterLevel > alertLevel) {
      state = 'PELIGRO';
    } else if (waterLevel > normalLevel) {
      state = 'ALERTA';
    }

    // Crear medición
    const measurement = await MeasurementService.createMeasurement(deviceId, {
      distance,
      waterLevel,
      state,
      temperature,
      tankHeight
    });

    // Verificar si es necesario generar alerta
    const alert = await AlertService.createAlert(deviceId, state);

    if (alert) {
      logger.info(`Alert generated: ${deviceId} -> ${state}`);
    }

    res.status(201).json({
      success: true,
      measurement,
      alert: alert ? { id: alert.id, state: alert.state } : null
    });
  } catch (err) {
    logger.error('Error creating measurement:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  }
});

// GET /api/measurements/latest
router.get('/latest', auth, [
  query('deviceId').notEmpty()
], async (req, res) => {
  try {
    const { deviceId } = req.query;

    const measurement = await MeasurementService.getLatestMeasurement(deviceId);

    if (!measurement) {
      return res.status(404).json({
        success: false,
        error: 'No measurements found'
      });
    }

    res.json({
      success: true,
      measurement
    });
  } catch (err) {
    logger.error('Error getting latest measurement:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  }
});

// GET /api/measurements
router.get('/', auth, [
  query('deviceId').notEmpty(),
  query('limit').optional().isInt({ max: 1000 }),
  query('offset').optional().isInt()
], async (req, res) => {
  try {
    const { deviceId, startDate, endDate, limit = 100, offset = 0 } = req.query;

    const result = await MeasurementService.getMeasurementHistory(deviceId, {
      startDate,
      endDate,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: result.data,
      total: result.total,
      limit: result.limit,
      offset: result.offset
    });
  } catch (err) {
    logger.error('Error getting measurements:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  }
});

module.exports = router;
