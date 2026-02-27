const EXPO_PUBLIC_ENV = {
  EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
  EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ?? '',
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
  EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? ''
} as const;

type EnvKey = keyof typeof EXPO_PUBLIC_ENV;

const REQUIRED_KEYS: EnvKey[] = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID'
];

function readEnvVar(key: EnvKey): string {
  return EXPO_PUBLIC_ENV[key].trim();
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
    iosClientId: readEnvVar('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID')
  }
};
