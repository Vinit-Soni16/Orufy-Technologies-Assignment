import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const USER_KEY = 'productr_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch (_) {}
  }, []);

  const login = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (_) {}
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(USER_KEY);
    } catch (_) {}
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      user: null,
      login: () => {},
      logout: () => {},
    };
  }
  return ctx;
}
