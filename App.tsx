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
    background: '#101010',
    card: '#1D1D1D',
    text: '#FAFAFA',
    border: '#363636',
    primary: '#ED1A43'
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
