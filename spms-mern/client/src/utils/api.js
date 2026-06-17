// utils/api.js
// A pre-configured axios instance that automatically attaches the
// logged-in user's JWT token to every request (if present).

import axios from 'axios';

const api = axios.create({ baseURL: 'https://spms-mern-development.up.railway.app' });

// Before every request, check localStorage for a token and attach it.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('spms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the server ever responds with 401 (token expired/invalid),
// automatically log the user out so they can sign in again.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('spms_token');
      localStorage.removeItem('spms_user');
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

export default api;
