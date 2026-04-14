// Navbar
// src/components/Navbar.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { BiLogOut } from 'react-icons/bi';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <h2>🌊 IoT Inundaciones</h2>
        </div>

        <div className="navbar-user">
          <span>{user?.full_name}</span>
          <button onClick={handleLogout} className="logout-btn">
            <BiLogOut /> Salir
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
