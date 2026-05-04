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

export const getCurrentUser = () => {
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

// Also export with different names for compatibility
export const loginUser = login;
export const registerUser = register;
export const updateUserDetails = updateDetails;
export const updateUserPassword = updatePassword;
export const logoutUser = logout;
