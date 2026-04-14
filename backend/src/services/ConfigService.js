// Servicio de Configuración
// src/services/ConfigService.js

const db = require('../config/database');
const logger = require('../config/logger');

class ConfigService {
  /**
   * Obtener configuración para dispositivo
   */
  static async getConfig(deviceId) {
    try {
      const result = await db.query(
        `SELECT config_key, config_value, data_type
         FROM configurations
         WHERE device_id = (SELECT id FROM devices WHERE device_id = ?)
         OR device_id IS NULL
         ORDER BY device_id DESC`,
        [deviceId]
      );

      const config = {};
      result.rows.forEach(row => {
        let value = row.config_value;

        // Convertir tipos
        if (row.data_type === 'integer') {
          value = parseInt(value);
        } else if (row.data_type === 'float') {
          value = parseFloat(value);
        } else if (row.data_type === 'boolean') {
          value = value === 'true';
        }

        config[row.config_key] = value;
      });

      return config;
    } catch (err) {
      logger.error('Error getting config:', err);
      throw err;
    }
  }

  /**
   * Actualizar configuración
   */
  static async updateConfig(deviceId, configData, userId) {
    try {
      const device = await db.query(
        'SELECT id FROM devices WHERE device_id = ?',
        [deviceId]
      );

      if (device.rows.length === 0) {
        throw new Error('Device not found');
      }

      const dbDeviceId = device.rows[0].id;

      for (const [key, value] of Object.entries(configData)) {
        const existing = await db.query(
          'SELECT id FROM configurations WHERE device_id = ? AND config_key = ?',
          [dbDeviceId, key]
        );

        if (existing.rows.length > 0) {
          await db.query(
            `UPDATE configurations 
             SET config_value = ?, data_type = ?, updated_by = ?, updated_at = NOW(), version = version + 1
             WHERE device_id = ? AND config_key = ?`,
            [String(value), typeof value, userId, dbDeviceId, key]
          );
        } else {
          await db.query(
            `INSERT INTO configurations (device_id, config_key, config_value, data_type, updated_by)
             VALUES (?, ?, ?, ?, ?)`,
            [dbDeviceId, key, String(value), typeof value, userId]
          );
        }
      }

      // Registrar evento
      await db.query(
        `INSERT INTO event_logs (event_type, entity_type, entity_id, user_id, description)
         VALUES (?, ?, ?, ?, ?)`,
        ['CONFIG_CHANGED', 'device', dbDeviceId, userId, `Configuration updated for ${deviceId}`]
      );

      return await this.getConfig(deviceId);
    } catch (err) {
      logger.error('Error updating config:', err);
      throw err;
    }
  }
}

module.exports = ConfigService;
