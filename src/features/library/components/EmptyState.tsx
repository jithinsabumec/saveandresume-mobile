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
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 32
  },
  text: {
    color: '#7C7C7C',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20
  }
});
