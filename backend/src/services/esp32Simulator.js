// Simulador de ESP32
// backend/src/services/esp32Simulator.js

const http = require('http');
const logger = require('../config/logger');

class ESP32Simulator {
  constructor() {
    this.isRunning = false;
    this.devices = {};
    this.intervals = {};
    this.baseUrl = process.env.API_BASE_URL || 'http://localhost:3000/api';
    this.token = null;
  }

  /**
   * Inicializar simulador con un dispositivo
   */
  async initialize(deviceId, apiKey) {
    try {
      // Registrar dispositivo en el simulador
      this.devices[deviceId] = {
        device_id: deviceId,
        water_level: 50,
        distance: 200,
        temperature: 25,
        humidity: 65,
        battery: 85,
        lastSync: new Date(),
        isSimulated: true
      };

      this.token = apiKey;
      logger.info(`🌊 ESP32 Simulator initialized for device: ${deviceId}`);
      
      return true;
    } catch (error) {
      logger.error('Error initializing ESP32 Simulator:', error);
      return false;
    }
  }

  /**
   * Generar datos realistas de sensores
   */
  generateSensorData(deviceId) {
    const device = this.devices[deviceId];
    if (!device) return null;

    // Simulación de fluctuación de nivel de agua
    const waterLevelChange = (Math.random() - 0.5) * 4; // Cambio de ±2 cm
    const newWaterLevel = Math.max(0, Math.min(250, device.water_level + waterLevelChange));

    // Distancia = 350 - nivel de agua (sensor invertido)
    const newDistance = Math.max(50, 350 - newWaterLevel);

    // Temperatura con pequeñas variaciones
    const tempChange = (Math.random() - 0.5) * 1.5;
    const newTemperature = Math.max(15, Math.min(35, device.temperature + tempChange));

    // Humedad
    const newHumidity = Math.max(40, Math.min(90, 65 + (Math.random() - 0.5) * 10));

    // Batería decrece lentamente
    const newBattery = Math.max(5, device.battery - (Math.random() * 0.5));

    // Actualizar estado del dispositivo
    device.water_level = parseFloat(newWaterLevel.toFixed(2));
    device.distance = parseFloat(newDistance.toFixed(2));
    device.temperature = parseFloat(newTemperature.toFixed(1));
    device.humidity = parseFloat(newHumidity.toFixed(1));
    device.battery = parseFloat(newBattery.toFixed(1));
    device.lastSync = new Date();

    return {
      device_id: deviceId,
      water_level: device.water_level,
      distance: device.distance,
      temperature: device.temperature,
      humidity: device.humidity,
      battery: device.battery
    };
  }

  /**
   * Enviar datos al servidor (simular ESP32 POST)
   */
  async sendData(deviceId) {
    return new Promise((resolve) => {
      try {
        const data = this.generateSensorData(deviceId);
        
        if (!data) {
          logger.warn(`Device ${deviceId} not found in simulator`);
          resolve(false);
          return;
        }

        const postData = JSON.stringify(data);
        const options = {
          hostname: 'localhost',
          port: 3000,
          path: '/api/measurements',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'X-API-Key': this.token || 'simulator-key',
            'User-Agent': 'ESP32-Simulator/1.0'
          }
        };

        const req = http.request(options, (res) => {
          logger.debug(`📤 [ESP32-${deviceId}] Data sent:`, {
            water_level: data.water_level,
            distance: data.distance,
            temperature: data.temperature,
            battery: data.battery,
            status: res.statusCode
          });
          resolve(res.statusCode >= 200 && res.statusCode < 300);
        });

        req.on('error', (error) => {
          logger.warn(`⚠️  [ESP32-${deviceId}] Envío fallido:`, {
            message: error.message,
            attempt: 'retrying in next cycle'
          });
          resolve(false);
        });

        req.write(postData);
        req.end();
      } catch (error) {
        logger.error('Error in sendData:', error);
        resolve(false);
      }
    });
  }

  /**
   * Iniciar envío de datos periódicos
   */
  startDevice(deviceId, intervalMs = 30000) {
    if (this.intervals[deviceId]) {
      logger.warn(`Device ${deviceId} is already running`);
      return;
    }

    logger.info(`▶️  Iniciando simulación para ${deviceId} (cada ${intervalMs}ms)`);

    // Enviar datos inmediatamente
    this.sendData(deviceId);

    // Enviar datos periódicamente
    this.intervals[deviceId] = setInterval(() => {
      this.sendData(deviceId);
    }, intervalMs);

    this.isRunning = true;
  }

  /**
   * Detener envío para un dispositivo
   */
  stopDevice(deviceId) {
    if (this.intervals[deviceId]) {
      clearInterval(this.intervals[deviceId]);
      delete this.intervals[deviceId];
      logger.info(`⏹️  Simulación detenida para ${deviceId}`);
    }
  }

  /**
   * Detener todos los dispositivos
   */
  stopAll() {
    Object.keys(this.intervals).forEach(deviceId => {
      this.stopDevice(deviceId);
    });
    this.isRunning = false;
    logger.info('🛑 Todos los simuladores detenidos');
  }

  /**
   * Simular evento de alerta (cambio rápido de nivel)
   */
  async simulateAlertEvent(deviceId, targetWaterLevel, durationMs = 60000) {
    const device = this.devices[deviceId];
    if (!device) {
      logger.warn(`Device ${deviceId} not found`);
      return;
    }

    logger.warn(`⚠️  Simulando evento de alerta para ${deviceId}: ${targetWaterLevel} cm`);

    const originalLevel = device.water_level;
    const steps = 20;
    const stepSize = (targetWaterLevel - originalLevel) / steps;
    const stepInterval = durationMs / steps;

    // Cambiar gradualmente al nivel objetivo
    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepInterval));
      device.water_level = parseFloat((originalLevel + stepSize * i).toFixed(2));
      device.distance = parseFloat((350 - device.water_level).toFixed(2));
      logger.info(`[Alerta simulada] ${deviceId}: ${device.water_level} cm`);
    }

    // Regresar al nivel normal
    for (let i = steps; i >= 0; i--) {
      await new Promise(resolve => setTimeout(resolve, stepInterval));
      device.water_level = parseFloat((originalLevel + stepSize * i).toFixed(2));
      device.distance = parseFloat((350 - device.water_level).toFixed(2));
    }

    logger.info(`✅ Evento de alerta completado para ${deviceId}`);
  }

  /**
   * Obtener estado de todos los dispositivos
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      devicesCount: Object.keys(this.devices).length,
      activeDevices: Object.keys(this.intervals),
      devices: Object.values(this.devices),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Obtener datos de un dispositivo específico
   */
  getDeviceData(deviceId) {
    return this.devices[deviceId] || null;
  }

  /**
   * Modificar datos de un dispositivo
   */
  setDeviceData(deviceId, data) {
    if (!this.devices[deviceId]) {
      logger.warn(`Device ${deviceId} not found`);
      return false;
    }

    const device = this.devices[deviceId];
    if (data.water_level !== undefined) device.water_level = data.water_level;
    if (data.temperature !== undefined) device.temperature = data.temperature;
    if (data.humidity !== undefined) device.humidity = data.humidity;
    if (data.battery !== undefined) device.battery = data.battery;

    logger.info(`✏️  Datos del dispositivo ${deviceId} actualizados:`, data);
    return true;
  }

  /**
   * Simular desconexión (no enviar datos)
   */
  simulateDisconnect(deviceId) {
    logger.warn(`🔌 Desconexión simulada para ${deviceId}`);
    this.stopDevice(deviceId);
  }

  /**
   * Simular reconexión
   */
  simulateReconnect(deviceId, intervalMs = 30000) {
    logger.info(`🔌 Reconexión simulada para ${deviceId}`);
    this.startDevice(deviceId, intervalMs);
  }
}

// Singleton
let simulator = null;

function getSimulator() {
  if (!simulator) {
    simulator = new ESP32Simulator();
  }
  return simulator;
}

module.exports = {
  getSimulator,
  ESP32Simulator
};
