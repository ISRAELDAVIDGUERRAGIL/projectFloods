// Componente de Notificaciones
// frontend/src/components/Toast.jsx

import React, { useEffect, useState } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import './Toast.css';

function Toast() {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="toast-container">
      {notifications.map((notification) => (
        <ToastItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

function ToastItem({ notification, onClose }) {
  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(onClose, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration, onClose]);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <div className={`toast toast-${notification.type}`}>
      <div className="toast-icon">{getIcon(notification.type)}</div>
      <div className="toast-content">
        <p className="toast-title">{notification.title}</p>
        <p className="toast-message">{notification.message}</p>
        {notification.details && notification.details.length > 0 && (
          <div className="toast-details">
            {notification.details.map((detail, idx) => (
              <span key={idx} className="toast-detail">
                • {detail}
              </span>
            ))}
          </div>
        )}
      </div>
      <button className="toast-close" onClick={onClose}>✕</button>
    </div>
  );
}

export default Toast;
