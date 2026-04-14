// Página de Login
// src/pages/Login.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Login.css';

function Login() {
  const { login, error, loading } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('0000');
  const [password, setPassword] = useState('0000');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🌊 IoT Inundaciones</h1>
        <p>Sistema de Alerta Temprana</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Usuario</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="Ingresa tu usuario (0000)"
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="Ingresa tu contraseña"
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-info">
          <p><strong>Configuración Local Especial:</strong></p>
          <p>Usuario: 0000</p>
          <p>Contraseña: 0000</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
