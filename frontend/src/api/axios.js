import axios from 'axios';

/**
 * Local: http://localhost:5000/api
 * Render (same host): /api
 * Never call localhost from a deployed HTTPS site.
 */
function resolveApiUrl() {
  const envUrl = import.meta.env.VITE_API_URL;

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isBrowserLocal = host === 'localhost' || host === '127.0.0.1';

    if (!isBrowserLocal) {
      if (!envUrl || /localhost|127\.0\.0\.1/i.test(envUrl)) {
        return '/api';
      }
      return envUrl;
    }
  }

  return envUrl || 'http://localhost:5000/api';
}

const apiUrl = resolveApiUrl();

const api = axios.create({
  baseURL: apiUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const churchName =
  import.meta.env.VITE_CHURCH_NAME || 'Peniel Evangelical Fellowship';

/** API host for uploaded files; empty string = same origin */
export const apiOrigin = apiUrl.replace(/\/api\/?$/, '');

export function mediaUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${apiOrigin}${path.startsWith('/') ? path : `/${path}`}`;
}

export default api;
