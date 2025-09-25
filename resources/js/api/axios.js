import Axios from 'axios';

// Ambil URL backend dari meta atau fallback deteksi otomatis saat dev
const origin = window.location.origin;
const metaBackend = document.querySelector('meta[name="backend-url"]')?.getAttribute('content');
const envBackend = (import.meta.env && import.meta.env.VITE_BACKEND_URL) || undefined;
const defaultBackend = origin.includes(':517') ? 'http://127.0.0.1:8000' : origin;
export const backendBase = (envBackend || metaBackend || defaultBackend).replace(/\/$/, '');

// Klien untuk API (/api)
export const api = Axios.create({
  baseURL: `${backendBase}/api`,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Klien untuk root web (untuk /sanctum/csrf-cookie, dsb.)
export const web = Axios.create({
  baseURL: backendBase,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Interceptor Authorization (opsional: dukungan mode token jika diperlukan)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};

    const isIdempotent = (cfg) => (cfg.method || 'get').toUpperCase() === 'GET';
    const msg = String(error?.message || '').toLowerCase();
    const code = String(error?.code || '').toLowerCase();
    const status = error.response?.status;
    const isNetwork = !error.response || code === 'err_network' || code === 'econnaborted' || msg.includes('network') || msg.includes('client connection force closed') || msg.includes('clientconn.close') || msg.includes('timeout');
    const isTransientStatus = [408, 425, 429, 500, 502, 503, 504, 522, 524].includes(status);

    const shouldRetry = isIdempotent(config) && (isNetwork || isTransientStatus);
    if (shouldRetry) {
      config.__retryCount = (config.__retryCount || 0) + 1;
      const maxRetries = config.__maxRetries ?? 2;
      if (config.__retryCount <= maxRetries) {
        const delay = Math.min(1000, 250 * Math.pow(2, config.__retryCount - 1));
        await new Promise((res) => setTimeout(res, delay));
        return api.request(config);
      }
    }

    if (status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
