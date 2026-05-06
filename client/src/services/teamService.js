import api from './api';

export const getTeams = () => {
  return api.get('/teams');
};

export const getTeam = (id) => {
  return api.get(`/teams/${id}`);
};

export const createTeam = (teamData) => {
  return api.post('/teams', teamData);
};

export const deleteTeam = (id) => {
  return api.delete(`/teams/${id}`);
};

export const addTeamMember = (teamId, userId, role) => {
  return api.post(`/teams/${teamId}/members`, { userId, role });
};

export const removeTeamMember = (teamId, userId) => {
  return api.delete(`/teams/${teamId}/members/${userId}`);
};

export const updateTeam = (id, teamData) => {
  return api.put(`/teams/${id}`, teamData);
};
