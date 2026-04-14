// Servicio de Mediciones
// src/services/MeasurementService.js

const db = require('../config/database');
const logger = require('../config/logger');

class MeasurementService {
  /**
   * Crear nueva medición
   */
  static async createMeasurement(deviceId, data) {
    try {
      // Buscar dispositivo
      const deviceResult = await db.query(
        'SELECT id FROM devices WHERE device_id = ?',
        [deviceId]
      );

      if (deviceResult.rows.length === 0) {
        throw new Error('Device not found');
      }

      const device = deviceResult.rows[0];
      const waterLevel = data.tankHeight - data.distance;

      // Insertar medición
      const insertResult = await db.query(
        `INSERT INTO readings (device_id, distance, water_level, state, temperature)
         VALUES (?, ?, ?, ?, ?)`,
        [device.id, data.distance, waterLevel, data.state, data.temperature]
      );
      
      const newId = insertResult.insertId;
      const result = await db.query('SELECT * FROM readings WHERE id = ?', [newId]);

      // Actualizar battery level del dispositivo
      if (data.battery) {
        await db.query(
          'UPDATE devices SET battery_level = ?, last_connection = NOW() WHERE id = ?',
          [data.battery, device.id]
        );
      }

      return result.rows[0];
    } catch (err) {
      logger.error('Error creating measurement:', err);
      throw err;
    }
  }

  /**
   * Obtener última medición
   */
  static async getLatestMeasurement(deviceId) {
    try {
      const result = await db.query(
        `SELECT r.* FROM readings r
         JOIN devices d ON d.id = r.device_id
         WHERE d.device_id = ?
         ORDER BY r.created_at DESC
         LIMIT 1`,
        [deviceId]
      );

      return result.rows[0] || null;
    } catch (err) {
      logger.error('Error getting latest measurement:', err);
      throw err;
    }
  }

  /**
   * Obtener historial de mediciones
   */
  static async getMeasurementHistory(deviceId, options = {}) {
    try {
      const { startDate, endDate, limit = 100, offset = 0 } = options;

      let query = `SELECT r.* FROM readings r
                   JOIN devices d ON d.id = r.device_id
                   WHERE d.device_id = ?`;
      const params = [deviceId];

      if (startDate) {
        query += ` AND r.created_at >= ?`;
        params.push(new Date(startDate));
      }

      if (endDate) {
        query += ` AND r.created_at <= ?`;
        params.push(new Date(endDate));
      }

      query += ` ORDER BY r.created_at DESC LIMIT ? OFFSET ?`;
      // Asegurar que limit y offset sean enteros para MySQL
      params.push(parseInt(limit), parseInt(offset));

      const result = await db.query(query, params);

      // Obtener total
      let countQuery = `SELECT COUNT(*) as total FROM readings r
                        JOIN devices d ON d.id = r.device_id
                        WHERE d.device_id = ?`;
      const countParams = [deviceId];

      if (startDate) {
        countQuery += ` AND r.created_at >= ?`;
        countParams.push(new Date(startDate));
      }

      if (endDate) {
        countQuery += ` AND r.created_at <= ?`;
        countParams.push(new Date(endDate));
      }

      const countResult = await db.query(countQuery, countParams);

      return {
        data: result.rows,
        total: parseInt(countResult.rows[0].total),
        limit: parseInt(limit),
        offset: parseInt(offset)
      };
    } catch (err) {
      logger.error('Error getting measurement history:', err);
      throw err;
    }
  }

  /**
   * Obtener estadísticas
   */
  static async getStatistics(deviceId, period = '30d') {
    try {
      // Parsear período (sintaxis adaptada para MySQL)
      let intervalSql;
      switch (period) {
        case '24h':
          intervalSql = "NOW() - INTERVAL 24 HOUR";
          break;
        case '7d':
          intervalSql = "NOW() - INTERVAL 7 DAY";
          break;
        case '30d':
          intervalSql = "NOW() - INTERVAL 30 DAY";
          break;
        default:
          intervalSql = "NOW() - INTERVAL 30 DAY";
      }

      const queryCode = `
         SELECT 
           COUNT(*) as total_readings,
           AVG(water_level) as average_level,
           MAX(water_level) as max_level,
           MIN(water_level) as min_level,
           SUM(CASE WHEN state = 'PELIGRO' THEN 1 ELSE 0 END) as danger_count
         FROM readings r
         JOIN devices d ON d.id = r.device_id
         WHERE d.device_id = ? AND r.created_at >= ${intervalSql}`;
         
      const result = await db.query(queryCode, [deviceId]);

      return result.rows[0];
    } catch (err) {
      logger.error('Error getting statistics:', err);
      throw err;
    }
  }
}

module.exports = MeasurementService;
