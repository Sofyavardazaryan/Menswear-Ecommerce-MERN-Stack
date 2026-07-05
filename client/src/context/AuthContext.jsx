import { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService.js';

export const AuthContext = createContext(null);

const TOKEN_KEY = 'edgers_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while rehydrating session

  // ─── Rehydrate session on mount ─────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .getMe()
      .then(setUser)
      .catch((err) => {
        // Only discard the token if the server explicitly rejected it (401).
        // Network errors or server downtime should not log the user out.
        if (err.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // ─── Actions ─────────────────────────────────────────────────────────────────
  const register = useCallback(async (credentials) => {
    const { user, token } = await authService.register(credentials);
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
    return user;
  }, []);

  const login = useCallback(async (credentials) => {
    const { user, token } = await authService.login(credentials);
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const updated = await authService.updateMe(updates);
    setUser(updated);
    return updated;
  }, []);

  // ─── Value ───────────────────────────────────────────────────────────────────
  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    register,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
