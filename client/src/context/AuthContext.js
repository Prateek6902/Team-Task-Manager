import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
const context = useContext(AuthContext);
if (!context) {
throw new Error('useAuth must be used within AuthProvider');
}
return context;
};

export const AuthProvider = ({ children }) => {
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
checkAuth();
}, []);

const checkAuth = async () => {
try {
const token = localStorage.getItem('token');


  if (!token) {
    setLoading(false);
    return;
  }

  const res = await api.get('/auth/me');
  setUser(res.user);

} catch (error) {
  console.log('Auth check failed:', error.message);
  localStorage.removeItem('token');
  setUser(null);
} finally {
  setLoading(false);
}


};

const login = async (email, password) => {
try {
const res = await api.post('/auth/login', {
email,
password
});


  const { token, user } = res;

  localStorage.setItem('token', token);
  setUser(user);

  return { success: true };
} catch (error) {
  return {
    success: false,
    message: error?.response?.data?.message || 'Login failed'
  };
}


};

const register = async (name, email, password) => {
try {
const res = await api.post('/auth/register', {
name,
email,
password
});


  const { token, user } = res;

  localStorage.setItem('token', token);
  setUser(user);

  return { success: true };
} catch (error) {
  return {
    success: false,
    message: error?.response?.data?.message || 'Register failed'
  };
}


};

const logout = () => {
localStorage.removeItem('token');
setUser(null);
window.location.href = '/login';
};

return (
<AuthContext.Provider value={{ user, loading, login, register, logout }}>
{children}
</AuthContext.Provider>
);
};
  
