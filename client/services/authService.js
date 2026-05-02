import api from './api';

export const login = (email, password) => {
  return api.post('/auth/login', { email, password });
};

export const register = (userData) => {
  return api.post('/auth/register', userData);
};

export const getMe = () => {
  return api.get('/auth/me');
};

export const logout = () => {
  return api.post('/auth/logout');
};

export const updateDetails = (userData) => {
  return api.put('/auth/updatedetails', userData);
};

export const updatePassword = (passwords) => {
  return api.put('/auth/updatepassword', passwords);
};