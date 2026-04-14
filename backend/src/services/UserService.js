// Servicio de Usuarios
// src/services/UserService.js

const db = require('../config/database');
const logger = require('../config/logger');
const bcrypt = require('bcryptjs');

class UserService {
  /**
   * Crear usuario
   */
  static async createUser(data, createdBy) {
    try {
      // Verificar que no exista
      const existing = await db.query(
        'SELECT id FROM users WHERE email = ?',
        [data.email]
      );

      if (existing.rows.length > 0) {
        throw new Error('Email already exists');
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const insertResult = await db.query(
        `INSERT INTO users (email, password, full_name, phone, role, active)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [data.email, hashedPassword, data.full_name, data.phone || null, data.role || 'VISUALIZADOR', true]
      );
      
      const newUserId = insertResult.insertId;
      const result = await db.query(
        'SELECT id, email, full_name, role, active, created_at FROM users WHERE id = ?', 
        [newUserId]
      );

      // Registrar evento
      await db.query(
        `INSERT INTO event_logs (event_type, entity_type, entity_id, user_id, description)
         VALUES (?, ?, ?, ?, ?)`,
        ['USER_CREATED', 'user', newUserId, createdBy, `User created: ${data.email}`]
      );

      return result.rows[0];
    } catch (err) {
      logger.error('Error creating user:', err);
      throw err;
    }
  }

  /**
   * Obtener usuarios
   */
  static async getUsers(limit = 50, offset = 0) {
    try {
      const result = await db.query(
        'SELECT id, email, full_name, role, active, last_login, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );

      const countResult = await db.query('SELECT COUNT(*) as total FROM users');

      return {
        data: result.rows,
        total: parseInt(countResult.rows[0].total),
        limit,
        offset
      };
    } catch (err) {
      logger.error('Error getting users:', err);
      throw err;
    }
  }

  /**
   * Cambiar contraseña
   */
  static async changePassword(userId, oldPassword, newPassword) {
    try {
      const userResult = await db.query(
        'SELECT password FROM users WHERE id = ?',
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      // Verificar contraseña actual
      const passwordMatch = await bcrypt.compare(oldPassword, userResult.rows[0].password);

      if (!passwordMatch) {
        throw new Error('Invalid password');
      }

      // Encriptar nueva
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await db.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );

      logger.info(`Password changed for user ${userId}`);
      return true;
    } catch (err) {
      logger.error('Error changing password:', err);
      throw err;
    }
  }
}

module.exports = UserService;
