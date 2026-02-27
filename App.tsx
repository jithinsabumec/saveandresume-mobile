import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useFonts } from 'expo-font';
import { Text, TextInput } from 'react-native';

import { queryClient } from './src/app/queryClient';
import { CenteredLoader } from './src/components/CenteredLoader';
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

const globalTextStyle = { fontFamily: 'Manrope_500Medium' as const };
let globalTypographyApplied = false;

function withGlobalTextStyle(existingStyle: unknown) {
  if (!existingStyle) {
    return globalTextStyle;
  }

  if (Array.isArray(existingStyle)) {
    return [globalTextStyle, ...existingStyle];
  }

  return [globalTextStyle, existingStyle];
}

function applyGlobalTypography() {
  if (globalTypographyApplied) {
    return;
  }

  const textComponent = Text as unknown as { defaultProps?: { style?: unknown } };
  textComponent.defaultProps = textComponent.defaultProps ?? {};
  textComponent.defaultProps.style = withGlobalTextStyle(textComponent.defaultProps.style);

  const inputComponent = TextInput as unknown as { defaultProps?: { style?: unknown } };
  inputComponent.defaultProps = inputComponent.defaultProps ?? {};
  inputComponent.defaultProps.style = withGlobalTextStyle(inputComponent.defaultProps.style);

  globalTypographyApplied = true;
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Manrope_500Medium: require('./assets/fonts/Manrope_500Medium.ttf'),
    Manrope_600SemiBold: require('./assets/fonts/Manrope_600SemiBold.ttf'),
    SpaceMono_400Regular: require('./assets/fonts/SpaceMono_400Regular.ttf')
  });

  if (!fontsLoaded && !fontError) {
    return <CenteredLoader />;
  }

  applyGlobalTypography();

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
