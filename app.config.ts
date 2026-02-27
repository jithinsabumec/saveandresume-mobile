import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const appEnv = process.env.APP_ENV ?? 'development';
  const isProduction = appEnv === 'production';

  return {
    ...config,
    name: 'Timestamp Saver',
    slug: 'save-and-resume',
    owner: 'jihtinsabu-organization',
    scheme: 'timestampsaver',
    version: '1.0.0',
    orientation: 'portrait',
    jsEngine: 'hermes',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#0B0B0B'
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.saveandresume.mobile',
      googleServicesFile: './GoogleService-Info.plist'
    },
    android: {
      package: 'com.saveandresume.mobile',
      versionCode: 6,
      googleServicesFile: './google-services.json',
      ...(isProduction
        ? {
            blockedPermissions: [
              'android.permission.SYSTEM_ALERT_WINDOW',
              'android.permission.READ_EXTERNAL_STORAGE',
              'android.permission.WRITE_EXTERNAL_STORAGE'
            ]
          }
        : {}),
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0B0B0B'
      }
    },
    plugins: [
      ...(isProduction ? [] : ['expo-dev-client']),
      [
        'expo-font',
        {
          fonts: [
            './assets/fonts/Manrope_500Medium.ttf',
            './assets/fonts/Manrope_600SemiBold.ttf',
            './assets/fonts/SpaceMono_400Regular.ttf'
          ]
        }
      ],
      [
        'expo-build-properties',
        {
          android: {
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            minSdkVersion: 24
          },
          ios: {
            deploymentTarget: '15.1'
          }
        }
      ],
      './plugins/withAndroidShareIntent',
      '@react-native-google-signin/google-signin'
    ],
    extra: {
      eas: {
        projectId: '48cd327f-4063-4d1c-87bb-00f1c1f5e818'
      }
    }
  };
};
