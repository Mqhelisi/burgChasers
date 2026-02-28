// Central API helper: choose base URL by environment
const DEFAULT_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://burgchasers.onrender.com');
export const API_BASE = DEFAULT_BASE;

// Simple public fetch wrapper. Usage: api('/api/products')
export const api = (path, options = {}) => {
  return fetch(`${API_BASE}${path}`, options);
};

export default api;
