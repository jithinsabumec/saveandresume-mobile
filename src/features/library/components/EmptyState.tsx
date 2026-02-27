import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function EmptyState() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>No timestamps here yet. Share a YouTube URL from the YouTube app.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 80,
    paddingHorizontal: 20
  },
  text: {
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22
  }
});
