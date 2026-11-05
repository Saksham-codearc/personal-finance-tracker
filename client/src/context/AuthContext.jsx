import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, TOKEN_KEY } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setLoading(false);
      return undefined;
    }

    authApi
      .me()
      .then((response) => {
        if (active) setUser(response.data.data.user);
      })
      .catch(() => {
        if (active) {
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('finora:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('finora:unauthorized', handleUnauthorized);
  }, [logout]);

  const login = useCallback(async (credentials) => {
    const response = await authApi.login(credentials);
    const { token, user: nextUser } = response.data.data;
    localStorage.setItem(TOKEN_KEY, token);
    setUser(nextUser);
    return nextUser;
  }, []);

  const register = useCallback(async (payload) => {
    const response = await authApi.register(payload);
    const { token, user: nextUser } = response.data.data;
    localStorage.setItem(TOKEN_KEY, token);
    setUser(nextUser);
    return nextUser;
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const response = await authApi.updateProfile(payload);
    setUser(response.data.data.user);
    return response.data.data.user;
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateProfile }),
    [user, loading, login, register, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
}
