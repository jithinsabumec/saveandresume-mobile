import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';

import { accountRepository } from '../../data/accountRepository';
import { authService } from '../../services/authService';

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
  signingIn: boolean;
  signingOut: boolean;
  deletingAccount: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

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
      deletingAccount,
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
      },
      deleteAccount: async () => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
          throw new Error('You are no longer signed in.');
        }

        setDeletingAccount(true);
        try {
          await authService.reauthenticateWithGoogle(currentUser);
          await accountRepository.deleteAccountData(currentUser.uid);
          await authService.deleteCurrentUser(currentUser);
        } finally {
          setDeletingAccount(false);
        }
      }
    }),
    [deletingAccount, initializing, signingIn, signingOut, user]
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
