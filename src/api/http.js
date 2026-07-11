import axios from 'axios';
import { apiBaseUrl } from '../config/api.js';

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true
});

let accessToken = localStorage.getItem('accessToken') || '';
let refreshingPromise = null;

export const setAccessToken = (token) => {
  accessToken = token || '';
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
  window.dispatchEvent(new Event('auth-token-changed'));
};

const refreshAccessToken = async () => {
  if (!refreshingPromise) {
    refreshingPromise = api.post('/auth/refresh').then((response) => {
      const token = response.data?.data?.accessToken || '';
      setAccessToken(token);
      return token;
    }).finally(() => {
      refreshingPromise = null;
    });
  }
  return refreshingPromise;
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      originalRequest._retry = true;
      try {
        const token = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch {
        setAccessToken('');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
