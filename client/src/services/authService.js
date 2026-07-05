import apiClient from './apiClient.js';

export const register = async ({ name, email, password }) => {
  const { data } = await apiClient.post('/auth/register', { name, email, password });
  return data.data; // { user, token }
};

export const login = async ({ email, password }) => {
  const { data } = await apiClient.post('/auth/login', { email, password });
  return data.data; // { user, token }
};

export const logout = async () => {
  await apiClient.post('/auth/logout');
};

export const getMe = async () => {
  const { data } = await apiClient.get('/auth/me');
  return data.data.user;
};

export const updateMe = async (updates) => {
  const { data } = await apiClient.put('/auth/me', updates);
  return data.data.user;
};
