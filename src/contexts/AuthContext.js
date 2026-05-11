import React, { createContext, useEffect, useState } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, continueAsGuest as apiContinueAsGuest, restoreSession, } from '../services/authService';

export const AuthContext = createContext({
  user: null,
  mode: 'signedOut',
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  continueAsGuest: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('signedOut');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const session = await restoreSession();

      if (session.token) {
        setUser(session.user);
        setMode('authenticated');
      } else if (session.mode === 'guest') {
        setUser(null);
        setMode('guest');
      } else {
        setUser(null);
        setMode('signedOut');
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const signIn = async (credentials) => {
    const { token, user: authUser } = await apiLogin(credentials);
    setUser(authUser);
    setMode('authenticated');
    return { token, user: authUser };
  };

  const signUp = async (payload) => {
    const { token, user: authUser } = await apiRegister(payload);
    setUser(authUser);
    setMode('authenticated');
    return { token, user: authUser };
  };

  const signOut = async () => {
    await apiLogout();
    setUser(null);
    setMode('signedOut');
  };

  const continueAsGuest = async () => {
    await apiContinueAsGuest();
    setUser(null);
    setMode('guest');
  };

  return (
    <AuthContext.Provider value={{ user, mode, loading, signIn, signUp, signOut, continueAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
};
