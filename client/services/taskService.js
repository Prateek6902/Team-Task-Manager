import api from './api';

export const getTasks = (params) => {
  return api.get('/tasks', { params });
};

export const getTask = (id) => {
  return api.get(`/tasks/${id}`);
};

export const createTask = (taskData) => {
  return api.post('/tasks', taskData);
};

export const updateTask = (id, taskData) => {
  return api.put(`/tasks/${id}`, taskData);
};

export const deleteTask = (id) => {
  return api.delete(`/tasks/${id}`);
};

export const updateTaskStatus = (id, status) => {
  return api.patch(`/tasks/${id}/status`, { status });
};

export const addTaskComment = (id, text) => {
  return api.post(`/tasks/${id}/comments`, { text });
};