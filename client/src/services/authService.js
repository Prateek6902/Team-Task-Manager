// client/src/services/authService.js

import api from './api';

// Login
export const login = (email, password) => {
  return api.post('/auth/login', { email, password });
};

// Register (primary)
export const register = (userData) => {
  return api.post('/auth/register', userData);
};

// ✅ Alias to prevent build errors
export const registerUser = (name, email, password) => {
  return api.post('/auth/register', { name, email, password });
};

// Get current user
export const getMe = () => {
  return api.get('/auth/me');
};

// Optional duplicate (safe)
export const getCurrentUser = () => {
  return api.get('/auth/me');
};

// Update profile
export const updateDetails = (userData) => {
  return api.put('/auth/updatedetails', userData);
};

// Change password
export const updatePassword = (passwords) => {
  return api.put('/auth/updatepassword', passwords);
};

// Logout
export const logout = () => {
  return api.post('/auth/logout');
};
