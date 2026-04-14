// Servicio de Dispositivos
// src/services/DeviceService.js

const db = require('../config/database');
const logger = require('../config/logger');
const crypto = require('crypto');

class DeviceService {
  /**
   * Registrar dispositivo
   */
  static async registerDevice(userId, data) {
    try {
      // Generar device_id único si no se proporciona
      const deviceId = data.device_id || `DEVICE_${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

      // Verificar que no exista
      const existing = await db.query(
        'SELECT id FROM devices WHERE device_id = ?',
        [deviceId]
      );

      if (existing.rows.length > 0) {
        throw new Error('Device ID already exists');
      }

      const insertResult = await db.query(
        `INSERT INTO devices (device_id, user_id, location, description, status)
         VALUES (?, ?, ?, ?, ?)`,
        [deviceId, userId, data.location, data.description || '', 'ACTIVO']
      );
      
      const newId = insertResult.insertId;
      const result = await db.query('SELECT * FROM devices WHERE id = ?', [newId]);

      // Registrar evento
      await db.query(
        `INSERT INTO event_logs (event_type, entity_type, entity_id, user_id, description)
         VALUES (?, ?, ?, ?, ?)`,
        ['DEVICE_REGISTERED', 'device', newId, userId, `Device registered: ${deviceId}`]
      );

      return result.rows[0];
    } catch (err) {
      logger.error('Error registering device:', err);
      throw err;
    }
  }

  /**
   * Obtener dispositivos del usuario
   */
  static async getUserDevices(userId) {
    try {
      const result = await db.query(
        'SELECT * FROM devices WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );

      return result.rows;
    } catch (err) {
      logger.error('Error getting user devices:', err);
      throw err;
    }
  }

  /**
   * Obtener dispositivo por ID
   */
  static async getDevice(deviceId) {
    try {
      const result = await db.query(
        'SELECT * FROM devices WHERE device_id = ?',
        [deviceId]
      );

      return result.rows[0] || null;
    } catch (err) {
      logger.error('Error getting device:', err);
      throw err;
    }
  }

  /**
   * Actualizar dispositivo
   */
  static async updateDevice(deviceId, data) {
    try {
      const fields = [];
      const params = [];

      if (data.location) {
        fields.push(`location = ?`);
        params.push(data.location);
      }

      if (data.description !== undefined) {
        fields.push(`description = ?`);
        params.push(data.description);
      }

      if (data.status) {
        fields.push(`status = ?`);
        params.push(data.status);
      }

      if (fields.length === 0) {
        return await this.getDevice(deviceId);
      }

      fields.push(`updated_at = NOW()`);
      params.push(deviceId); // Para el WHERE clause

      await db.query(
        `UPDATE devices SET ${fields.join(', ')} WHERE device_id = ?`,
        params
      );
      
      return await this.getDevice(deviceId);
    } catch (err) {
      logger.error('Error updating device:', err);
      throw err;
    }
  }

  /**
   * Eliminar dispositivo
   */
  static async deleteDevice(deviceId, userId) {
    try {
      // Verificar que el usuario sea el dueño
      const device = await db.query(
        'SELECT user_id, id FROM devices WHERE device_id = ?',
        [deviceId]
      );

      if (device.rows.length === 0) {
        throw new Error('Device not found');
      }

      if (device.rows[0].user_id !== userId) {
        throw new Error('Unauthorized');
      }

      await db.query('DELETE FROM devices WHERE device_id = ?', [deviceId]);

      // Registrar evento
      await db.query(
        `INSERT INTO event_logs (event_type, entity_type, entity_id, user_id, description)
         VALUES (?, ?, ?, ?, ?)`,
        ['DEVICE_DELETED', 'device', device.rows[0].id, userId, `Device deleted: ${deviceId}`]
      );

      return true;
    } catch (err) {
      logger.error('Error deleting device:', err);
      throw err;
    }
  }

  /**
   * Generar API Key para dispositivo
   */
  static async generateApiKey(deviceId) {
    try {
      const apiKey = `sk_live_${crypto.randomBytes(32).toString('hex')}`;

      // En producción, guardar en BD
      // Por ahora retornar
      return apiKey;
    } catch (err) {
      logger.error('Error generating API key:', err);
      throw err;
    }
  }
}

module.exports = DeviceService;
