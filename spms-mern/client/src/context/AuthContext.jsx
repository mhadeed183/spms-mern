// context/AuthContext.jsx
// Provides global authentication state (current user + token) to the
// entire app via React Context, so any component can check "who's logged
// in" without prop-drilling.

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On first app load, check if we have a saved session in localStorage
  useEffect(() => {
    const token   = localStorage.getItem('spms_token');
    const savedUser = localStorage.getItem('spms_user');
    if (token && savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  // Called after successful login/register
  function login(token, userData) {
    localStorage.setItem('spms_token', token);
    localStorage.setItem('spms_user', JSON.stringify(userData));
    setUser(userData);
  }

  // Update the cached profile (after editing name/semester/image)
  function updateProfile(profile) {
    const updated = { ...user, profile };
    localStorage.setItem('spms_user', JSON.stringify(updated));
    setUser(updated);
  }

  function logout() {
    localStorage.removeItem('spms_token');
    localStorage.removeItem('spms_user');
    setUser(null);
  }

  // Register a new account
  async function register(username, password) {
    const { data } = await api.post('/auth/register', { username, password });
    login(data.token, data.user);
  }

  // Log into an existing account
  async function signIn(username, password) {
    const { data } = await api.post('/auth/login', { username, password });
    login(data.token, data.user);
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, signIn, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for easy access: const { user, logout } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
