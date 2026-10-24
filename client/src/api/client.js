import axios from 'axios';

const TOKEN_KEY = 'sv_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthAttempt = url.includes('/auth/login') || url.includes('/auth/register');
    if (status === 401 && !isAuthAttempt && localStorage.getItem(TOKEN_KEY)) {
      window.dispatchEvent(new CustomEvent('sv:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error) => {
  if (error?.code === 'ECONNABORTED') {
    return 'The request timed out. Please check your connection and try again.';
  }
  if (!error?.response) {
    return 'Unable to reach the server. Please make sure the API is running.';
  }
  return error.response.data?.message || 'Something went wrong. Please try again.';
};

export const getErrorDetails = (error) => {
  const details = error?.response?.data?.details;
  if (!details) return [];
  if (Array.isArray(details)) return details;
  if (Array.isArray(details.errors)) return details.errors;
  return [];
};

export default api;
