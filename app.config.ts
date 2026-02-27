import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Timestamp Saver',
  slug: 'timestamp-saver-mobile',
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
    googleServicesFile: './google-services.json',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0B0B0B'
    }
  },
  plugins: [
    'expo-dev-client',
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
      projectId: 'replace-me'
    }
  }
});
