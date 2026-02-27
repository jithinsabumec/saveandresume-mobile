const REQUIRED_KEYS = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID'
] as const;

function readEnvVar(key: string): string {
  const value = process.env[key];
  return typeof value === 'string' ? value.trim() : '';
}

function assertRequiredEnv(): void {
  const missing = REQUIRED_KEYS.filter((key) => readEnvVar(key).length === 0);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export function validateEnvironment(): void {
  assertRequiredEnv();
}

export const env = {
  firebase: {
    apiKey: readEnvVar('EXPO_PUBLIC_FIREBASE_API_KEY'),
    authDomain: readEnvVar('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: readEnvVar('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket: readEnvVar('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: readEnvVar('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    appId: readEnvVar('EXPO_PUBLIC_FIREBASE_APP_ID'),
    measurementId: readEnvVar('EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID')
  },
  google: {
    webClientId: readEnvVar('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'),
    iosClientId: readEnvVar('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID'),
    androidClientId: readEnvVar('EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID')
  }
};
