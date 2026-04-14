// Store de Dispositivos
// src/store/deviceStore.js

import create from 'zustand';
import { deviceApi, measurementApi, alertApi } from '../services/api';

export const useDeviceStore = create((set) => ({
  devices: [],
  selectedDevice: null,
  currentMeasurement: null,
  alerts: [],
  loading: false,
  error: null,

  loadDevices: async () => {
    set({ loading: true });
    try {
      const res = await deviceApi.list();
      set({ devices: res.data.devices, loading: false });
      return res.data.devices;
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  selectDevice: async (deviceId) => {
    set({ selectedDevice: deviceId, loading: true });
    try {
      const res = await measurementApi.getLatest(deviceId);
      set({ currentMeasurement: res.data.measurement, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  loadMeasurementHistory: async (deviceId, options = {}) => {
    try {
      const res = await measurementApi.getHistory(deviceId, options);
      return res.data;
    } catch (err) {
      set({ error: err.message });
    }
  },

  loadAlerts: async () => {
    try {
      const res = await alertApi.getActive();
      set({ alerts: res.data.alerts });
    } catch (err) {
      set({ error: err.message });
    }
  },

  createDevice: async (data) => {
    try {
      const res = await deviceApi.create(data);
      set((state) => ({
        devices: [...state.devices, res.data.device]
      }));
      return res.data.device;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteDevice: async (deviceId) => {
    try {
      await deviceApi.delete(deviceId);
      set((state) => ({
        devices: state.devices.filter(d => d.device_id !== deviceId)
      }));
    } catch (err) {
      set({ error: err.message });
    }
  },

  triggerAlarm: async (deviceId) => {
    try {
      const res = await alertApi.triggerAlarm(deviceId);
      return res.data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },
}));
