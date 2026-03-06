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
      <View style={styles.gradientTint} />
      <View style={styles.container}>
        <View style={styles.hero}>
          <AppLogoIcon width={48.7063} height={48} />
          <View style={styles.textGroup}>
            <Text style={styles.title}>Never lose a moment.</Text>
            <Text style={styles.subtitle}>
              Save any moment in a YouTube video and jump straight back to it whenever you need it.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable style={styles.button} onPress={onSignIn} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FAFAFA" />
            ) : (
              <>
                <GoogleLogoIcon width={19.198} height={19.52} />
                <Text style={styles.buttonText}>Continue with google</Text>
              </>
            )}
          </Pressable>

          <Text style={styles.legalText}>
            By continuing, you acknowledge that you have read and agree to our{' '}
            <Text style={styles.legalLink}>Terms of Use</Text> and <Text style={styles.legalLink}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#101010'
  },
  gradientTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#101010',
    opacity: 0.95
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 180,
    paddingBottom: 24
  },
  hero: {
    width: '100%',
    maxWidth: 342,
    alignItems: 'center',
    gap: 48
  },
  textGroup: {
    width: 342,
    alignItems: 'center',
    gap: 16
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 43,
    fontFamily: 'FunnelDisplay_600SemiBold',
    textAlign: 'center'
  },
  subtitle: {
    color: '#A0A0A0',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'Manrope_500Medium',
    textAlign: 'center',
    letterSpacing: 0.18,
    width: 296
  },
  footer: {
    width: '100%',
    maxWidth: 342,
    alignItems: 'center',
    gap: 24
  },
  button: {
    width: '100%',
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ED1A43',
    backgroundColor: 'rgba(255, 27, 71, 0.4)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'Manrope_600SemiBold'
  },
  legalText: {
    color: '#7A7A7A',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.16,
    textAlign: 'center',
    fontFamily: 'Manrope_500Medium'
  },
  legalLink: {
    color: '#B3B3B3',
    textDecorationLine: 'underline',
    fontFamily: 'Manrope_600SemiBold'
  }
});
