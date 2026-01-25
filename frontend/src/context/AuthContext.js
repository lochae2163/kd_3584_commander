import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [governor, setGovernor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('rokToken');
      if (token) {
        const response = await authService.getMe();
        setUser(response.data.user);
        setGovernor(response.data.governor);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('rokToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (loginValue, password) => {
    const response = await authService.login(loginValue, password);
    localStorage.setItem('rokToken', response.data.token);
    setUser(response.data.user);
    setGovernor(response.data.governor);
    return response.data;
  };

  const register = async (data) => {
    const response = await authService.register(data);
    localStorage.setItem('rokToken', response.data.token);
    setUser(response.data.user);
    setGovernor(response.data.governor);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('rokToken');
    setUser(null);
    setGovernor(null);
  };

  const updateGovernor = (newGovernor) => {
    setGovernor(newGovernor);
    if (newGovernor && user) {
      setUser({ ...user, governorId: newGovernor._id });
    }
  };

  const value = {
    user,
    governor,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateGovernor,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
