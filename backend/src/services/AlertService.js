// Servicio de Alertas
// src/services/AlertService.js

const db = require('../config/database');
const logger = require('../config/logger');

class AlertService {
  /**
   * Crear alerta
   */
  static async createAlert(deviceId, state, triggeredBy = 'AUTOMATIC') {
    try {
      // Verificar si hay alerta activa con mismo estado
      const existingAlert = await db.query(
        'SELECT id FROM alerts WHERE device_id = ? AND state = ? AND resolved_at IS NULL',
        [deviceId, state]
      );

      if (existingAlert.rows.length > 0) {
        return null; // Alerta ya existe
      }

      const insertResult = await db.query(
        `INSERT INTO alerts (device_id, state, triggered_by)
         VALUES (?, ?, ?)`,
        [deviceId, state, triggeredBy]
      );
      
      const newId = insertResult.insertId;
      const result = await db.query('SELECT * FROM alerts WHERE id = ?', [newId]);

      return result.rows[0];
    } catch (err) {
      logger.error('Error creating alert:', err);
      throw err;
    }
  }

  /**
   * Obtener alertas activas
   */
  static async getActiveAlerts() {
    try {
      const result = await db.query(
        `SELECT a.*, d.device_id, d.location
         FROM alerts a
         JOIN devices d ON d.id = a.device_id
         WHERE a.resolved_at IS NULL
         ORDER BY a.triggered_at DESC`
      );

      return result.rows;
    } catch (err) {
      logger.error('Error getting active alerts:', err);
      throw err;
    }
  }

  /**
   * Obtener historial de alertas
   */
  static async getAlertHistory(deviceId, options = {}) {
    try {
      const { limit = 50, offset = 0 } = options;

      const result = await db.query(
        `SELECT a.* FROM alerts a
         JOIN devices d ON d.id = a.device_id
         WHERE d.device_id = ?
         ORDER BY a.triggered_at DESC
         LIMIT ? OFFSET ?`,
        [deviceId, parseInt(limit), parseInt(offset)]
      );

      // Obtener total
      const countResult = await db.query(
        'SELECT COUNT(*) as total FROM alerts a JOIN devices d ON d.id = a.device_id WHERE d.device_id = ?',
        [deviceId]
      );

      return {
        data: result.rows,
        total: parseInt(countResult.rows[0].total),
        limit: parseInt(limit),
        offset: parseInt(offset)
      };
    } catch (err) {
      logger.error('Error getting alert history:', err);
      throw err;
    }
  }

  /**
   * Resolver alerta
   */
  static async resolveAlert(alertId) {
    try {
      await db.query(
        'UPDATE alerts SET resolved_at = NOW() WHERE id = ?',
        [alertId]
      );
      
      const result = await db.query('SELECT * FROM alerts WHERE id = ?', [alertId]);

      return result.rows[0];
    } catch (err) {
      logger.error('Error resolving alert:', err);
      throw err;
    }
  }

  /**
   * Disparar alarma manual
   */
  static async triggerManualAlarm(deviceId, userId, duration = 30) {
    try {
      const userResult = await db.query(
        'SELECT email FROM users WHERE id = ?',
        [userId]
      );

      const user = userResult.rows[0];

      const insertResult = await db.query(
        `INSERT INTO alerts (device_id, state, triggered_by)
         VALUES (?, ?, ?)`,
        [deviceId, 'PELIGRO', user.email]
      );
      
      const newId = insertResult.insertId;
      const result = await db.query('SELECT * FROM alerts WHERE id = ?', [newId]);

      // Registrar evento
      await db.query(
        `INSERT INTO event_logs (event_type, entity_type, entity_id, user_id, description)
         VALUES (?, ?, ?, ?, ?)`,
        ['ALARM_ACTIVATED', 'alert', newId, userId, `Manual alarm triggered for ${duration}s`]
      );

      return result.rows[0];
    } catch (err) {
      logger.error('Error triggering alarm:', err);
      throw err;
    }
  }
}

module.exports = AlertService;
