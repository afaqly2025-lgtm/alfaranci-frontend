import api, { setAccessToken } from './http.js';

export const loginRequest = async (payload) => {
  const response = await api.post('/auth/login', payload);
  const token = response.data?.data?.accessToken || '';
  setAccessToken(token);
  return response.data.data;
};

export const logoutRequest = async () => {
  await api.post('/auth/logout');
  setAccessToken('');
};

export const meRequest = async () => {
  const response = await api.get('/auth/me');
  return response.data.data;
};
