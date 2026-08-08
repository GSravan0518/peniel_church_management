import axios from 'axios';

// Local: http://localhost:5000/api · Render (same host): /api
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

/** API host for uploaded files, e.g. http://localhost:5000 */
export const apiOrigin = (apiUrl || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

export function mediaUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${apiOrigin}${path.startsWith('/') ? path : `/${path}`}`;
}

export default api;
