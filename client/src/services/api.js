import axios from 'axios';

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://team-task-manager-3-jks2.onrender.com";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Return only data
api.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

export default api;
