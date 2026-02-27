import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';

import { authService } from '../../services/authService';

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
  signingIn: boolean;
  signingOut: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((nextUser) => {
      setUser(nextUser);
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      signingIn,
      signingOut,
      signIn: async () => {
        setSigningIn(true);
        try {
          await authService.signInWithGoogle();
        } finally {
          setSigningIn(false);
        }
      },
      signOut: async () => {
        setSigningOut(true);
        try {
          await authService.signOut();
        } finally {
          setSigningOut(false);
        }
      }
    }),
    [initializing, signingIn, signingOut, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
