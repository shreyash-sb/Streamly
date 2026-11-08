import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
  setGuestName: () => {},
  guestName: '',
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guestName, setGuestNameState] = useState(() => localStorage.getItem('streamly_guest_name') || '');

  const setGuestName = (name) => {
    setGuestNameState(name);
    if (name) {
      localStorage.setItem('streamly_guest_name', name);
    } else {
      localStorage.removeItem('streamly_guest_name');
    }
  };

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch (err) {
      console.warn('Session expired or DB unavailable, clearing token.');
      localStorage.removeItem('accessToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    localStorage.setItem('accessToken', data.token);
    setUser(data.user);
    return data;
  };

  const register = async (name, username, password, email) => {
    const { data } = await api.post('/auth/register', { name, username, password, email });
    localStorage.setItem('accessToken', data.token);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const { data } = await api.put('/auth/profile', profileData);
    setUser(data.user);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        guestName,
        setGuestName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
