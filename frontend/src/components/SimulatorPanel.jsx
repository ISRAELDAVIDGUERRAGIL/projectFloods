// Componente de Control del Simulador ESP32
// frontend/src/components/SimulatorPanel.jsx

import React, { useState, useEffect } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import api from '../services/api';
import './SimulatorPanel.css';

function SimulatorPanel() {
  const { success, error } = useNotificationStore();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [formData, setFormData] = useState({
    device_id: 'ESP32-001',
    water_level: 50,
    temperature: 25,
    humidity: 65,
    battery: 85,
    interval_ms: 30000,
    alert_level: 150,
    alert_duration: 60000
  });

  // Cargar estado del simulador
  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const response = await api.get('/simulator/status');
      setStatus(response.data.data);
    } catch (err) {
      // Silencioso si no existe
    }
  };

  const handleInitialize = async () => {
    setLoading(true);
    try {
      await api.post('/simulator/device/init', {
        device_id: formData.device_id,
        api_key: 'simulator-key'
      });
      success('Dispositivo inicializado', 'El ESP32 ha sido creado en el simulador');
      loadStatus();
    } catch (err) {
      error('Error', 'No se pudo inicializar el dispositivo');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      await api.post('/simulator/device/start', {
        device_id: formData.device_id,
        interval_ms: formData.interval_ms
      });
      success('Simulación iniciada', `${formData.device_id} enviará datos cada ${formData.interval_ms}ms`);
      loadStatus();
    } catch (err) {
      error('Error', 'No se pudo iniciar la simulación');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await api.post('/simulator/device/stop', {
        device_id: formData.device_id
      });
      success('Simulación detenida', `${formData.device_id} ha dejado de enviar datos`);
      loadStatus();
    } catch (err) {
      error('Error', 'No se pudo detener la simulación');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateAlert = async () => {
    setLoading(true);
    try {
      await api.post('/simulator/device/alert', {
        device_id: formData.device_id,
        target_level: formData.alert_level,
        duration_ms: formData.alert_duration
      });
      success('Alerta simulada', `Nivel de agua llegará a ${formData.alert_level} cm`);
      loadStatus();
    } catch (err) {
      error('Error', 'No se pudo simular la alerta');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateData = async () => {
    setLoading(true);
    try {
      await api.put(`/simulator/device/${formData.device_id}`, {
        water_level: formData.water_level,
        temperature: formData.temperature,
        humidity: formData.humidity,
        battery: formData.battery
      });
      success('Datos actualizados', 'Los valores del sensor han sido modificados');
      loadStatus();
    } catch (err) {
      error('Error', 'No se pudo actualizar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await api.post('/simulator/device/disconnect', {
        device_id: formData.device_id
      });
      success('Desconectado', `${formData.device_id} ha sido desconectado`);
      loadStatus();
    } catch (err) {
      error('Error', 'No se pudo desconectar');
    } finally {
      setLoading(false);
    }
  };

  const handleStopAll = async () => {
    setLoading(true);
    try {
      await api.post('/simulator/stop-all');
      success('Todos detenidos', 'Todas las simulaciones han sido detenidas');
      loadStatus();
    } catch (err) {
      error('Error', 'No se pudo detener todas las simulaciones');
    } finally {
      setLoading(false);
    }
  };

  if (!status) {
    return null;
  }

  const isDeviceActive = status.activeDevices.includes(formData.device_id);

  return (
    <div className="simulator-panel">
      <button
        className="simulator-toggle"
        onClick={() => setExpanded(!expanded)}
        title="Toggle Simulator"
      >
        🤖 {expanded ? '▼' : '▶'} Simulador ESP32
      </button>

      {expanded && (
        <div className="simulator-content">
          <div className="simulator-header">
            <h3>🌊 Panel de Control - ESP32 Simulator</h3>
            <div className="simulator-status">
              <span className={`status-badge ${status.isRunning ? 'active' : 'inactive'}`}>
                {status.isRunning ? '🟢 Activo' : '⚪ Inactivo'}
              </span>
              <span className="device-count">
                {status.devicesCount} dispositivos
              </span>
            </div>
          </div>

          {/* Device ID Input */}
          <div className="form-group">
            <label>ID del Dispositivo</label>
            <input
              type="text"
              value={formData.device_id}
              onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
              placeholder="ej: ESP32-001"
            />
          </div>

          {/* Action Buttons */}
          <div className="button-group">
            <button
              onClick={handleInitialize}
              disabled={loading}
              className="btn btn-init"
              title="Crear dispositivo en el simulador"
            >
              ➕ Inicializar
            </button>
            <button
              onClick={handleStart}
              disabled={loading || isDeviceActive}
              className="btn btn-start"
              title="Iniciar envío de datos"
            >
              ▶️ Iniciar
            </button>
            <button
              onClick={handleStop}
              disabled={loading || !isDeviceActive}
              className="btn btn-stop"
              title="Detener envío de datos"
            >
              ⏹️ Detener
            </button>
          </div>

          {/* Interval Control */}
          <div className="form-group">
            <label>Intervalo de Envío (ms)</label>
            <input
              type="number"
              min="1000"
              max="600000"
              step="1000"
              value={formData.interval_ms}
              onChange={(e) => setFormData({ ...formData, interval_ms: parseInt(e.target.value) })}
            />
            <small>{(formData.interval_ms / 1000).toFixed(0)} segundos</small>
          </div>

          {/* Sensor Values */}
          <div className="sensor-values">
            <h4>📊 Valores de Sensores</h4>

            <div className="form-group">
              <label>💧 Nivel de Agua</label>
              <div className="input-with-range">
                <input
                  type="range"
                  min="0"
                  max="300"
                  value={formData.water_level}
                  onChange={(e) => setFormData({ ...formData, water_level: parseFloat(e.target.value) })}
                />
                <input
                  type="number"
                  min="0"
                  max="300"
                  step="0.1"
                  value={formData.water_level}
                  onChange={(e) => setFormData({ ...formData, water_level: parseFloat(e.target.value) })}
                />
                <span className="unit">cm</span>
              </div>
            </div>

            <div className="form-group">
              <label>🌡️ Temperatura</label>
              <div className="input-with-range">
                <input
                  type="range"
                  min="-50"
                  max="150"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                />
                <input
                  type="number"
                  min="-50"
                  max="150"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                />
                <span className="unit">°C</span>
              </div>
            </div>

            <div className="form-group">
              <label>💧 Humedad</label>
              <div className="input-with-range">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.humidity}
                  onChange={(e) => setFormData({ ...formData, humidity: parseFloat(e.target.value) })}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.humidity}
                  onChange={(e) => setFormData({ ...formData, humidity: parseFloat(e.target.value) })}
                />
                <span className="unit">%</span>
              </div>
            </div>

            <div className="form-group">
              <label>🔋 Batería</label>
              <div className="input-with-range">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.battery}
                  onChange={(e) => setFormData({ ...formData, battery: parseFloat(e.target.value) })}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.battery}
                  onChange={(e) => setFormData({ ...formData, battery: parseFloat(e.target.value) })}
                />
                <span className="unit">%</span>
              </div>
            </div>

            <button
              onClick={handleUpdateData}
              disabled={loading}
              className="btn btn-update"
            >
              ✏️ Actualizar Valores
            </button>
          </div>

          {/* Alert Simulation */}
          <div className="alert-simulation">
            <h4>⚠️ Simular Alerta</h4>

            <div className="form-group">
              <label>Nivel Objetivo (cm)</label>
              <input
                type="number"
                min="0"
                max="300"
                step="0.1"
                value={formData.alert_level}
                onChange={(e) => setFormData({ ...formData, alert_level: parseFloat(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>Duración (ms)</label>
              <input
                type="number"
                min="1000"
                max="300000"
                step="1000"
                value={formData.alert_duration}
                onChange={(e) => setFormData({ ...formData, alert_duration: parseInt(e.target.value) })}
              />
              <small>{(formData.alert_duration / 1000).toFixed(0)} segundos</small>
            </div>

            <button
              onClick={handleSimulateAlert}
              disabled={loading || !isDeviceActive}
              className="btn btn-alert"
            >
              🔔 Generar Alerta
            </button>
          </div>

          {/* Connection Control */}
          <div className="connection-control">
            <h4>🔌 Control de Conexión</h4>
            <div className="button-group">
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="btn btn-disconnect"
              >
                🔌 Desconectar
              </button>
              <button
                onClick={handleStopAll}
                disabled={loading}
                className="btn btn-stop-all"
              >
                🛑 Detener Todo
              </button>
            </div>
          </div>

          {/* Active Devices Info */}
          {status.activeDevices.length > 0 && (
            <div className="active-devices">
              <h4>✨ Dispositivos Activos</h4>
              <div className="device-list">
                {status.activeDevices.map(deviceId => (
                  <span key={deviceId} className="device-tag">
                    ✓ {deviceId}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SimulatorPanel;
