// Store de Notificaciones
// frontend/src/store/notificationStore.js

import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = Date.now();
    const fullNotification = {
      id,
      duration: 5000, // 5 segundos por defecto
      ...notification
    };

    set((state) => ({
      notifications: [...state.notifications, fullNotification]
    }));

    return id;
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    }));
  },

  clearAll: () => {
    set({ notifications: [] });
  },

  // Helpers
  success: (title, message, details = []) => {
    const store = useNotificationStore.getState();
    return store.addNotification({
      type: 'success',
      title,
      message,
      details,
      duration: 3000
    });
  },

  error: (title, message, details = []) => {
    const store = useNotificationStore.getState();
    return store.addNotification({
      type: 'error',
      title,
      message,
      details,
      duration: 5000
    });
  },

  warning: (title, message, details = []) => {
    const store = useNotificationStore.getState();
    return store.addNotification({
      type: 'warning',
      title,
      message,
      details,
      duration: 4000
    });
  },

  info: (title, message, details = []) => {
    const store = useNotificationStore.getState();
    return store.addNotification({
      type: 'info',
      title,
      message,
      details,
      duration: 3000
    });
  }
}));
