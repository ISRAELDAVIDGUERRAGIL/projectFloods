// Ruta de Alertas - COMPLETA
// src/routes/alerts.js

const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const AlertService = require('../services/AlertService');
const logger = require('../config/logger');

// GET /api/alerts - Obtener alertas activas
router.get('/', auth, async (req, res) => {
  try {
    const alerts = await AlertService.getActiveAlerts();

    res.json({
      success: true,
      alerts
    });
  } catch (err) {
    logger.error('Error getting active alerts:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  }
});

// GET /api/alerts/history - Historial de alertas
router.get('/history', auth, [
  query('deviceId').notEmpty(),
  query('limit').optional().isInt(),
  query('offset').optional().isInt()
], async (req, res) => {
  try {
    const { deviceId, limit = 50, offset = 0 } = req.query;

    const result = await AlertService.getAlertHistory(deviceId, {
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
    logger.error('Error getting alert history:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  }
});

// POST /api/alerts/trigger-alarm - Activar alarma manual
router.post('/trigger-alarm', auth, [
  body('deviceId').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { deviceId } = req.body;

    const alert = await AlertService.triggerManualAlarm(
      deviceId,
      req.user.id,
      30 // 30 segundos
    );

    res.json({
      success: true,
      alert,
      message: 'Alarm activated for 30 seconds'
    });
  } catch (err) {
    logger.error('Error triggering alarm:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  }
});

// POST /api/alerts/:alertId/resolve - Resolver alerta
router.post('/:alertId/resolve', auth, async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await AlertService.resolveAlert(alertId);

    res.json({
      success: true,
      alert,
      message: 'Alert resolved'
    });
  } catch (err) {
    logger.error('Error resolving alert:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  }
});

module.exports = router;
