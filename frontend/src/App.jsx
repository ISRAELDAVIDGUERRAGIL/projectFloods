// App principal
// src/App.jsx

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import SimulatorPanel from './components/SimulatorPanel';
import './App.css';

function App() {
  const { token, isAuthenticated } = useAuthStore();

  return (
    <Router>
      <div className="app">
        {isAuthenticated() && <Navbar />}
        <Toast />
        {isAuthenticated() && <SimulatorPanel />}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
