import React from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { AppLogoIcon, GoogleLogoIcon } from '../../../components/FigmaIcons';

interface Props {
  loading: boolean;
  onSignIn: () => void;
}

export function SignInScreen({ loading, onSignIn }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <AppLogoIcon width={48.7063} height={48} />
          <View style={styles.textGroup}>
            <Text style={styles.title}>Never lose a moment.</Text>
            <Text style={styles.subtitle}>
              Save YouTube timestamps on your phone, pick them up on your desktop. Everything stays in sync.
            </Text>
          </View>
        </View>

        <Pressable style={styles.button} onPress={onSignIn} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FAFAFA" />
          ) : (
            <>
              <GoogleLogoIcon width={19.198} height={19.52} />
              <Text style={styles.buttonText}>CONTINUE WITH GOOGLE</Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#101010'
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24
  },
  hero: {
    flex: 1,
    width: '100%',
    maxWidth: 342,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 120,
    gap: 48
  },
  textGroup: {
    width: '100%',
    alignItems: 'center',
    gap: 16
  },
  title: {
    color: '#F5F5F5',
    fontSize: 30,
    lineHeight: 43,
    fontFamily: 'Manrope_600SemiBold',
    textAlign: 'center'
  },
  subtitle: {
    color: '#A0A0A0',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'Manrope_500Medium',
    textAlign: 'center',
    letterSpacing: 0.18
  },
  button: {
    width: 342,
    minHeight: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ED1A43',
    backgroundColor: 'rgba(255, 27, 71, 0.4)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'SpaceMono_400Regular'
  }
});
