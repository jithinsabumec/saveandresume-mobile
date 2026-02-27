import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { BrandMark } from './BrandMark';

export function CenteredLoader() {
  return (
    <View style={styles.container}>
      <BrandMark size="large" />
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
