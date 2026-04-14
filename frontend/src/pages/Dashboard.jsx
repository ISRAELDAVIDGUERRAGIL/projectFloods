// Componente Dashboard - MEJORADO
// src/pages/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDeviceStore } from '../store/deviceStore';
import { useAuthStore } from '../store/authStore';
import { BiWater } from 'react-icons/bi';
import './Dashboard.css';

function Dashboard() {
  const { devices, selectedDevice, currentMeasurement, alerts, loadDevices, selectDevice, loadMeasurementHistory } = useDeviceStore();
  useAuthStore();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar hora cada segundo
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadDevices();
    const refreshInterval = setInterval(() => {
      if (selectedDevice) loadMeasurementHistory(selectedDevice, { limit: 20 });
    }, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(refreshInterval);
  }, [loadDevices, selectedDevice, loadMeasurementHistory]);

  useEffect(() => {
    if (devices.length > 0 && !selectedDevice) {
      selectDevice(devices[0].device_id);
    }
  }, [devices, selectedDevice, selectDevice]);

  useEffect(() => {
    if (selectedDevice) {
      const loadHistory = async () => {
        const data = await loadMeasurementHistory(selectedDevice, { limit: 30 });
        if (data) {
          setHistory(data.data.reverse());
          if (data.data.length > 0) {
            const levels = data.data.map(m => m.water_level);
            setStats({
              current: currentMeasurement?.water_level || 0,
              max: Math.max(...levels),
              min: Math.min(...levels),
              average: (levels.reduce((a, b) => a + b, 0) / levels.length).toFixed(2),
              distance: currentMeasurement?.distance || 0,
              temperature: currentMeasurement?.temperature || 0,
              battery: currentMeasurement?.battery || 0,
            });
          }
        }
      };
      loadHistory();
    }
  }, [selectedDevice, loadMeasurementHistory, currentMeasurement]);

  const getStateColor = (state) => {
    switch (state) {
      case 'PELIGRO': return '#ef4444';
      case 'ALERTA': return '#eab308';
      case 'NORMAL': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getStateLabel = (state) => {
    switch (state) {
      case 'PELIGRO': return 'PELIGRO ⚠️';
      case 'ALERTA': return 'ALERTA 🟡';
      case 'NORMAL': return 'NORMAL ✅';
      default: return 'DESCONOCIDO';
    }
  };

  const getStateIcon = (state) => {
    switch (state) {
      case 'PELIGRO': return '🔴';
      case 'ALERTA': return '🟡';
      case 'NORMAL': return '🟢';
      default: return '⚪';
    }
  };

  const getTemperatureIcon = (temp) => {
    if (temp < 15) return '❄️';
    if (temp < 25) return '🌡️';
    return '🔥';
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>🌊 Sistema IoT Inundaciones</h1>
          <p>Panel de Control en Tiempo Real</p>
        </div>
        <div className="header-right">
          <div className="location-info">
            <span>📍 {selectedDevice || 'Sin seleccionar'}</span>
          </div>
          <div className="time-info">
            <span className="time">{currentTime.toLocaleTimeString()}</span>
            <span className="date">{currentTime.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {devices.length === 0 ? (
        <div className="no-devices">
          <p>No hay dispositivos registrados. Crea uno para comenzar.</p>
        </div>
      ) : (
        <div className="dashboard-content">
          {/* Sidebar Izquierdo */}
          <div className="dashboard-sidebar">
            {/* Selector de Dispositivos */}
            <div className="device-selector">
              <h3>Dispositivos</h3>
              {devices.map((device) => (
                <button
                  key={device.device_id}
                  className={`device-btn ${selectedDevice === device.device_id ? 'active' : ''}`}
                  onClick={() => selectDevice(device.device_id)}
                >
                  <div className="device-marker">📍</div>
                  <div className="device-info">
                    <span className="device-location">{device.location}</span>
                    <span className="device-status">{device.status}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Resumen Hoy */}
            {stats && (
              <div className="today-summary">
                <h3>Hoy</h3>
                <div className="summary-item">
                  <span className="label">Máximo</span>
                  <span className="value" style={{ color: '#ef4444' }}>{stats.max.toFixed(1)} cm</span>
                </div>
                <div className="summary-item">
                  <span className="label">Mínimo</span>
                  <span className="value" style={{ color: '#22c55e' }}>{stats.min.toFixed(1)} cm</span>
                </div>
                <div className="summary-item">
                  <span className="label">Promedio</span>
                  <span className="value" style={{ color: '#3b82f6' }}>{stats.average} cm</span>
                </div>
              </div>
            )}
          </div>

          {/* Contenido Principal */}
          <div className="dashboard-main">
            {/* Estado Principal - Nivel de Agua */}
            <div className="main-state" style={{ borderTopColor: getStateColor(currentMeasurement?.state) }}>
              <div className="state-top">
                <div className="state-icon">{getStateIcon(currentMeasurement?.state)}</div>
                <div className="state-info">
                  <p className="state-label">Nivel de Agua</p>
                  <p className="state-value">{currentMeasurement?.water_level.toFixed(2) || 0}<span className="unit">cm</span></p>
                </div>
              </div>
              <div className="state-badge" style={{ backgroundColor: getStateColor(currentMeasurement?.state) }}>
                {getStateLabel(currentMeasurement?.state)}
              </div>
            </div>

            {/* Grid de 3 Columns */}
            <div className="metrics-grid">
              {/* Distancia */}
              <div className="metric-card">
                <div className="metric-header">
                  <BiWater className="metric-icon" />
                  <h4>Distancia</h4>
                </div>
                <p className="metric-value">{stats?.distance.toFixed(2) || 0}<span className="metric-unit">cm</span></p>
                <p className="metric-desc">Sensor al agua</p>
              </div>

              {/* Temperatura */}
              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-icon-emoji">{getTemperatureIcon(stats?.temperature)}</span>
                  <h4>Temperatura</h4>
                </div>
                <p className="metric-value">{stats?.temperature?.toFixed(1) || 0}<span className="metric-unit">°C</span></p>
                <p className="metric-desc">Temperatura actual</p>
              </div>

              {/* Batería */}
              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-icon-emoji">🔋</span>
                  <h4>Batería</h4>
                </div>
                <p className="metric-value" style={{ color: stats?.battery > 50 ? '#22c55e' : stats?.battery > 20 ? '#eab308' : '#ef4444' }}>
                  {stats?.battery || 0}<span className="metric-unit">%</span>
                </p>
                <div className="battery-bar">
                  <div className="battery-fill" style={{ width: `${stats?.battery || 0}%`, backgroundColor: stats?.battery > 50 ? '#22c55e' : stats?.battery > 20 ? '#eab308' : '#ef4444' }}></div>
                </div>
              </div>
            </div>

            {/* Gráfico Principal */}
            <div className="chart-card full-width">
              <h3>📊 Últimas 24 horas</h3>
              {history.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={history}>
                    <defs>
                      <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                      dataKey="created_at"
                      tickFormatter={(date) => new Date(date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      stroke="#999"
                    />
                    <YAxis stroke="#999" />
                    <Tooltip 
                      formatter={(value) => [`${value.toFixed(2)} cm`, 'Nivel Agua']}
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="water_level"
                      stroke="#3b82f6"
                      fill="url(#colorWater)"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Historial de Datos */}
            {history.length > 0 && (
              <div className="data-history">
                <h3>📋 Historial de Datos</h3>
                <div className="history-stats">
                  <div className="history-stat">
                    <span className="history-label">Alertas</span>
                    <span className="history-value">{alerts.length || 0}</span>
                  </div>
                  <div className="history-stat">
                    <span className="history-label">Mediciones</span>
                    <span className="history-value">{history.length}</span>
                  </div>
                  <div className="history-stat">
                    <span className="history-label">Última</span>
                    <span className="history-value">{new Date(currentMeasurement?.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Alertas Activas */}
            {alerts.length > 0 && (
              <div className="alerts-card">
                <h3>⚠️ Alertas Activas ({alerts.length})</h3>
                <div className="alerts-list">
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="alert-item">
                      <div className="alert-icon" style={{ backgroundColor: getStateColor(alert.state) }}>
                        {getStateIcon(alert.state)}
                      </div>
                      <div className="alert-content">
                        <p className="alert-state">{getStateLabel(alert.state)}</p>
                        <p className="alert-device">{alert.device_id}</p>
                      </div>
                      <span className="alert-time">
                        {new Date(alert.triggered_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
