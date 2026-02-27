import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { queryClient } from './src/app/queryClient';
import { RootNavigator } from './src/app/RootNavigator';
import { AuthProvider } from './src/features/auth/AuthProvider';

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0A0B0F',
    card: '#111216',
    text: '#FAFAFA',
    border: '#24262E',
    primary: '#E4FF5D'
  }
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationContainer theme={navTheme}>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </QueryClientProvider>
  );
}
