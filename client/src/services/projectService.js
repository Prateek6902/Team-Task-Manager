import api from './api';

export const getProjects = (params) => {
  return api.get('/projects', { params });
};

export const getProject = (id) => {
  return api.get(`/projects/${id}`);
};

export const createProject = (projectData) => {
  return api.post('/projects', projectData);
};

export const updateProject = (id, projectData) => {
  return api.put(`/projects/${id}`, projectData);
};

export const deleteProject = (id) => {
  return api.delete(`/projects/${id}`);
};

export const addProjectMember = (projectId, userId, role) => {
  return api.post(`/projects/${projectId}/members`, { userId, role });
};

export const removeProjectMember = (projectId, userId) => {
  return api.delete(`/projects/${projectId}/members/${userId}`);
};