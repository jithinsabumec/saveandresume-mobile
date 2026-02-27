import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
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

export const authService = {
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    configureGoogleSignIn();
    return onAuthStateChanged(auth, callback);
  },

  async signInWithGoogle(): Promise<User> {
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

    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    return userCredential.user;
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
