import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  deleteUser,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithCredential,
  signOut,
  type User
} from 'firebase/auth';

import { env } from '../config/env';
import { auth } from './firebase';

let configured = false;

function configureGoogleSignIn(): void {
  if (configured) return;

  GoogleSignin.configure({
    webClientId: env.google.webClientId || undefined,
    iosClientId: env.google.iosClientId || undefined,
    offlineAccess: false
  });

  configured = true;
}

async function getGoogleIdToken(): Promise<string> {
  configureGoogleSignIn();

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const signInResult = (await GoogleSignin.signIn()) as unknown as {
    idToken?: string;
    data?: { idToken?: string };
  };

  const idToken = signInResult?.idToken ?? signInResult?.data?.idToken;
  if (!idToken) {
    throw new Error('Google Sign-In did not return an ID token.');
  }

  return idToken;
}

export const authService = {
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    configureGoogleSignIn();
    return onAuthStateChanged(auth, callback);
  },

  async signInWithGoogle(): Promise<User> {
    const idToken = await getGoogleIdToken();
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    return userCredential.user;
  },

  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  async reauthenticateWithGoogle(user: User): Promise<void> {
    const idToken = await getGoogleIdToken();
    const credential = GoogleAuthProvider.credential(idToken);
    await reauthenticateWithCredential(user, credential);
  },

  async deleteCurrentUser(user: User): Promise<void> {
    await deleteUser(user);
    try {
      await GoogleSignin.signOut();
    } catch {
      // Ignore Google session sign-out failures after account deletion.
    }
  },

  async signOut(): Promise<void> {
    await signOut(auth);
    try {
      await GoogleSignin.signOut();
    } catch {
      // Ignore Google session sign-out failures; Firebase sign-out already happened.
    }
  }
};
