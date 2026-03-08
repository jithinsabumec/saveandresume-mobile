import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppLogoIcon } from './FigmaIcons';

export function CenteredLoader() {
  return (
    <View style={styles.container}>
      <AppLogoIcon width={72} height={71} />
      <ActivityIndicator style={styles.loader} size="small" color="#ED1A43" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#101010'
  },
  loader: {
    marginTop: 40
  }
});
