// Ruta de Analytics - COMPLETA
// src/routes/analytics.js

const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const MeasurementService = require('../services/MeasurementService');
const AlertService = require('../services/AlertService');
const logger = require('../config/logger');

// GET /api/analytics/stats - Estadísticas
router.get('/stats', auth, [
  query('deviceId').notEmpty(),
  query('period').optional().isIn(['24h', '7d', '30d'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { deviceId, period = '30d' } = req.query;

    // Obtener estadísticas de mediciones
    const stats = await MeasurementService.getStatistics(deviceId, period);

    // Obtener historial de alertas para el período
    const alertResult = await AlertService.getAlertHistory(deviceId, { limit: 1000, offset: 0 });

    const response = {
      success: true,
      stats: {
        total_readings: parseInt(stats.total_readings),
        average_level: parseFloat(stats.average_level || 0).toFixed(2),
        max_level: parseFloat(stats.max_level || 0).toFixed(2),
        min_level: parseFloat(stats.min_level || 0).toFixed(2),
        danger_count: parseInt(stats.danger_count),
        total_alerts: alertResult.total,
        period
      }
    };

    res.json(response);
  } catch (err) {
    logger.error('Error getting stats:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  }
});

module.exports = router;
