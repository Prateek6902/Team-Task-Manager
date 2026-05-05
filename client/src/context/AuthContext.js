import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
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
      setUser(res.data.user);

    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
  try {
    const res = await api.post('/auth/login', { email, password });

    console.log('LOGIN RESPONSE:', res.data); // 🔍 IMPORTANT DEBUG

    // 🔥 HANDLE ALL CASES
    const token = res.data.token || res.data.data?.token;
    const user = res.data.user || res.data.data?.user;

    if (!token) {
      throw new Error('Token not received from server');
    }

    localStorage.setItem('token', token);
    setUser(user);

    return { success: true };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: error?.response?.data?.message || error.message || 'Login failed'
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

      const { token, user } = res.data;

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
