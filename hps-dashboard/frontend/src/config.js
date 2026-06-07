/**
 * Archivo de configuración de API
 */
const API_BASE = '/api';

const config = {
  apiBase: API_BASE,
  endpoints: {
    login: `${API_BASE}/auth/login`,
    me: `${API_BASE}/auth/me`,
    meses: `${API_BASE}/meses`,
    transacciones: `${API_BASE}/transacciones`,
    resumen: (anio) => `${API_BASE}/resumen/${anio}`,
    mes: (anio, mes) => `${API_BASE}/meses/${anio}/${mes}`,
  },
};

export default config;