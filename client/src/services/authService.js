import api from './api';

export const login = (email, password) => {
  return api.post('/auth/login', { email, password });
};

export const register = (userData) => {
  return api.post('/auth/register', userData);
};

// alias (prevents future errors)
export const registerUser = (name, email, password) => {
  return api.post('/auth/register', { name, email, password });
};

export const getMe = () => {
  return api.get('/auth/me');
};

export const updateDetails = (userData) => {
  return api.put('/auth/updatedetails', userData);
};

export const updatePassword = (passwords) => {
  return api.put('/auth/updatepassword', passwords);
};

export const logout = () => {
  return api.post('/auth/logout');
};
