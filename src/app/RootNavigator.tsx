import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Alert } from 'react-native';

import { CenteredLoader } from '../components/CenteredLoader';
import { useAuth } from '../features/auth/AuthProvider';
import { SignInScreen } from '../features/auth/components/SignInScreen';
import { LibraryScreen } from '../features/library/screens/LibraryScreen';

export type RootStackParamList = {
  Library: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user, initializing, signingIn, signingOut, signIn, signOut } = useAuth();

  if (initializing) {
    return <CenteredLoader />;
  }

  if (!user) {
    return (
      <SignInScreen
        loading={signingIn}
        onSignIn={() => {
          void signIn().catch((error) => {
            Alert.alert('Sign-In Failed', error instanceof Error ? error.message : 'Unable to sign in.');
          });
        }}
      />
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Library">
        {() => (
          <LibraryScreen
            userId={user.uid}
            signingOut={signingOut}
            onSignOut={() =>
              signOut().catch((error) => {
                Alert.alert('Sign-Out Failed', error instanceof Error ? error.message : 'Unable to sign out.');
                throw error;
              })
            }
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
