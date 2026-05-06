import api from './api';

export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (userData) => api.post('/auth/register', userData);
export const getMe = () => api.get('/auth/me');
export const getCurrentUser = () => api.get('/auth/me');
export const updateDetails = (userData) => api.put('/auth/updatedetails', userData);
export const updatePassword = (passwords) => api.put('/auth/updatepassword', passwords);
export const logout = () => api.post('/auth/logout');
