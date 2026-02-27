import React from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

interface Props {
  loading: boolean;
  onSignIn: () => void;
}

export function SignInScreen({ loading, onSignIn }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Timestamp Saver</Text>
        <Text style={styles.subtitle}>Save YouTube moments instantly from Share.</Text>

        <Pressable style={styles.button} onPress={onSignIn} disabled={loading}>
          {loading ? <ActivityIndicator color="#101010" /> : <Text style={styles.buttonText}>Continue with Google</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0B0B'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24
  },
  title: {
    color: '#FAFAFA',
    fontSize: 32,
    fontWeight: '700'
  },
  subtitle: {
    marginTop: 12,
    color: '#A1A1AA',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32
  },
  button: {
    borderRadius: 12,
    backgroundColor: '#E4FF5D',
    paddingVertical: 14,
    alignItems: 'center'
  },
  buttonText: {
    color: '#101010',
    fontSize: 16,
    fontWeight: '700'
  }
});
