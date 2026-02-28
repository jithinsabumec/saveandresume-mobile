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

function getDeleteAccountErrorMessage(error: unknown) {
  const code =
    typeof error === 'object' && error !== null && 'code' in error ? String((error as { code?: unknown }).code) : '';

  if (code === 'SIGN_IN_CANCELLED') {
    return 'Account deletion was cancelled.';
  }

  if (code === 'auth/network-request-failed') {
    return 'Please check your internet connection and try again.';
  }

  if (code === 'auth/no-current-user') {
    return 'You are no longer signed in. Please sign in again and try once more.';
  }

  if (error instanceof Error && error.message === 'You are no longer signed in.') {
    return error.message;
  }

  return 'Unable to delete your account right now. Please try again.';
}

export function RootNavigator() {
  const { user, initializing, signingIn, signingOut, deletingAccount, signIn, signOut, deleteAccount } = useAuth();

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
            userEmail={user.email ?? null}
            userDisplayName={user.displayName ?? null}
            userPhotoUrl={user.photoURL ?? null}
            signingOut={signingOut}
            deletingAccount={deletingAccount}
            onSignOut={() =>
              signOut().catch((error) => {
                Alert.alert('Sign-Out Failed', error instanceof Error ? error.message : 'Unable to sign out.');
                throw error;
              })
            }
            onDeleteAccount={() =>
              deleteAccount().catch((error) => {
                Alert.alert('Delete Account Failed', getDeleteAccountErrorMessage(error));
                throw error;
              })
            }
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
