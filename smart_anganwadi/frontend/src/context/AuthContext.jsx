import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('sams_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('sams_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('sams_token');
      if (storedToken) {
        try {
          const freshUser = await authService.getMe();
          setUser(freshUser);
          localStorage.setItem('sams_user', JSON.stringify(freshUser));
        } catch (err) {
          console.error('Failed to verify token on boot:', err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    const accessToken = data.access;
    const userData = data.user;

    localStorage.setItem('sams_token', accessToken);
    localStorage.setItem('sams_user', JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('sams_token');
    localStorage.removeItem('sams_user');
    setToken(null);
    setUser(null);
  };

  const hasRole = (allowedRoles) => {
    if (!user) return false;
    if (user.role === 'admin' || user.is_superuser) return true;
    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(user.role);
    }
    return user.role === allowedRoles;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, hasRole, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
