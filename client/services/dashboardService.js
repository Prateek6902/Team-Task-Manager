import api from './api';

export const getDashboardData = () => {
  return api.get('/dashboard');
};

export const getProjectStats = (projectId) => {
  return api.get(`/dashboard/project/${projectId}`);
};