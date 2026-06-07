import axios from 'axios';
import config from '../config';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: agregar token automáticamente
api.interceptors.request.use((req) => {
  const token = localStorage.getItem('hps_token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Interceptor: redirigir al login si token expirado
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hps_token');
      localStorage.removeItem('hps_usuario');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  login: (username, password) => api.post(config.endpoints.login, { username, password }),
  me: () => api.get(config.endpoints.me),
};

// Meses
export const mesesAPI = {
  list: () => api.get(config.endpoints.meses),
  get: (anio, mes) => api.get(config.endpoints.mes(anio, mes)),
  save: (anio, mes, data) => api.put(config.endpoints.mes(anio, mes), data),
};

// Transacciones
export const transaccionesAPI = {
  list: (params) => api.get(config.endpoints.transacciones, { params }),
  create: (data) => api.post(config.endpoints.transacciones, data),
};

// Resumen
export const resumenAPI = {
  get: (anio) => api.get(config.endpoints.resumen(anio)),
};

export default api;