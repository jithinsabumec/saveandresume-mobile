import { initializeApp } from 'firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { env, validateEnvironment } from '../config/env';

validateEnvironment();

const firebaseApp = initializeApp({
  apiKey: env.firebase.apiKey,
  authDomain: env.firebase.authDomain,
  projectId: env.firebase.projectId,
  storageBucket: env.firebase.storageBucket,
  messagingSenderId: env.firebase.messagingSenderId,
  appId: env.firebase.appId,
  ...(env.firebase.measurementId ? { measurementId: env.firebase.measurementId } : {})
});

const authInstance = (() => {
  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch {
    return getAuth(firebaseApp);
  }
})();

export const app = firebaseApp;
export const auth = authInstance;
export const db = getFirestore(firebaseApp);
