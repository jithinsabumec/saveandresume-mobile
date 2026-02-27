import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export function CenteredLoader() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#E4FF5D" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B0B0B'
  }
});
