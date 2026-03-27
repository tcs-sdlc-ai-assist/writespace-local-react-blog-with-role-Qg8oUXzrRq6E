import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as authLogin, logout as authLogout, register as authRegister, getSession } from '../utils/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getSession();
    if (stored) {
      setSession(stored);
    }
    setLoading(false);
  }, []);

  const login = useCallback((username, password) => {
    const result = authLogin(username, password);
    if (result.success) {
      setSession(result.session);
    }
    return result;
  }, []);

  const register = useCallback((displayName, username, password, confirmPassword) => {
    const result = authRegister(displayName, username, password, confirmPassword);
    if (result.success) {
      setSession(result.session);
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setSession(null);
  }, []);

  const value = {
    session,
    loading,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}