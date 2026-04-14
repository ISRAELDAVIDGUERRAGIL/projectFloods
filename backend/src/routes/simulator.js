// Rutas del Simulador ESP32
// backend/src/routes/simulator.js

const express = require('express');
const router = express.Router();
const { getSimulator } = require('../services/esp32Simulator');
const { body, validationResult } = require('express-validator');
const logger = require('../config/logger');

const simulator = getSimulator();

/**
 * GET /api/simulator/status
 * Obtener estado del simulador
 */
router.get('/status', (req, res) => {
  try {
    const status = simulator.getStatus();
    res.json({ success: true, data: status, message: 'Simulator status' });
  } catch (error) {
    logger.error('Error getting simulator status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/simulator/device/init
 * Inicializar un dispositivo en el simulador
 */
router.post('/device/init', [
  body('device_id').notEmpty().withMessage('Device ID required'),
  body('api_key').optional()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array(),
        message: 'Validation errors'
      });
    }

    const { device_id, api_key } = req.body;
    const initialized = simulator.initialize(device_id, api_key || 'simulator-key');

    if (!initialized) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to initialize device'
      });
    }

    res.status(201).json({
      success: true,
      data: { device_id, initialized: true },
      message: 'Device initialized in simulator'
    });
  } catch (error) {
    logger.error('Error initializing device:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/simulator/device/start
 * Iniciar envío de datos para un dispositivo
 */
router.post('/device/start', [
  body('device_id').notEmpty(),
  body('interval_ms').optional().isInt({ min: 1000, max: 600000 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { device_id, interval_ms = 30000 } = req.body;

    if (!simulator.devices[device_id]) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    simulator.startDevice(device_id, interval_ms);
    
    res.json({ success: true, data: { device_id, running: true, interval_ms }, message: 'Device simulation started' });
  } catch (error) {
    logger.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/simulator/device/stop
 * Detener envío de datos para un dispositivo
 */
router.post('/device/stop', [
  body('device_id').notEmpty()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { device_id } = req.body;

    if (!simulator.devices[device_id]) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    simulator.stopDevice(device_id);
    
    res.json({ success: true, data: { device_id, running: false }, message: 'Device simulation stopped' });
  } catch (error) {
    logger.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/simulator/stop-all
 * Detener todos los simuladores
 */
router.post('/stop-all', (req, res) => {
  try {
    simulator.stopAll();
    res.json({ success: true, data: {}, message: 'All simulations stopped' });
  } catch (error) {
    logger.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/simulator/device/alert
 * Simular evento de alerta
 */
router.post('/device/alert', [
  body('device_id').notEmpty(),
  body('target_level').isFloat({ min: 0, max: 300 }),
  body('duration_ms').optional().isInt({ min: 1000, max: 300000 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { device_id, target_level, duration_ms = 60000 } = req.body;

    if (!simulator.devices[device_id]) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    // Ejecutar en background
    simulator.simulateAlertEvent(device_id, target_level, duration_ms)
      .catch(err => logger.error('Alert simulation error:', err));

    res.status(202).json({ success: true, data: { device_id, target_level, duration_ms }, message: 'Alert simulation started' });
  } catch (error) {
    logger.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/simulator/device/:deviceId
 * Obtener datos de un dispositivo simulado
 */
router.get('/device/:deviceId', (req, res) => {
  try {
    const { deviceId } = req.params;
    const data = simulator.getDeviceData(deviceId);

    if (!data) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    res.json({ success: true, data, message: 'Device data' });
  } catch (error) {
    logger.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/simulator/device/:deviceId
 * Modificar datos de un dispositivo
 */
router.put('/device/:deviceId', [
  body('water_level').optional().isFloat({ min: 0, max: 300 }),
  body('temperature').optional().isFloat({ min: -50, max: 150 }),
  body('humidity').optional().isFloat({ min: 0, max: 100 }),
  body('battery').optional().isFloat({ min: 0, max: 100 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { deviceId } = req.params;
    const updated = simulator.setDeviceData(deviceId, req.body);

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    const data = simulator.getDeviceData(deviceId);
    res.json({ success: true, data, message: 'Device data updated' });
  } catch (error) {
    logger.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/simulator/device/disconnect
 * Simular desconexión
 */
router.post('/device/disconnect', [
  body('device_id').notEmpty()
], (req, res) => {
  try {
    const { device_id } = req.body;

    if (!simulator.devices[device_id]) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    simulator.simulateDisconnect(device_id);
    
    res.json({ success: true, data: { device_id, status: 'disconnected' }, message: 'Device disconnected' });
  } catch (error) {
    logger.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/simulator/device/reconnect
 * Simular reconexión
 */
router.post('/device/reconnect', [
  body('device_id').notEmpty(),
  body('interval_ms').optional().isInt({ min: 1000, max: 600000 })
], (req, res) => {
  try {
    const { device_id, interval_ms = 30000 } = req.body;

    if (!simulator.devices[device_id]) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    simulator.simulateReconnect(device_id, interval_ms);
    
    res.json({ success: true, data: { device_id, status: 'reconnected', interval_ms }, message: 'Device reconnected' });
  } catch (error) {
    logger.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/simulator/send-data/:deviceId
 * Enviar datos manualmente
 */
router.post('/send-data/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;

    if (!simulator.devices[deviceId]) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    const sent = await simulator.sendData(deviceId);

    if (!sent) {
      return res.status(500).json({ success: false, error: 'Failed to send data' });
    }

    const data = simulator.getDeviceData(deviceId);
    res.json({ success: true, data, message: 'Data sent successfully' });
  } catch (error) {
    logger.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
