import { ResizeMode, Video, type AVPlaybackSource } from 'expo-av';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  source: AVPlaybackSource | null;
  aspectRatio: number;
  shouldPlay: boolean;
}

export function HowItWorksMedia({ source, aspectRatio, shouldPlay }: Props) {
  return (
    <View style={[styles.frame, { aspectRatio }]}>
      {source ? (
        <Video
          style={styles.video}
          source={source}
          useNativeControls={false}
          shouldPlay={shouldPlay}
          isLooping
          resizeMode={ResizeMode.COVER}
        />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderTitle}>Add your how-it-works video</Text>
          <Text style={styles.placeholderText}>Set a video source in src/config/onboarding.ts</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#3A3A3A',
    backgroundColor: '#0A0A0A'
  },
  video: {
    width: '100%',
    height: '100%'
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 8
  },
  placeholderTitle: {
    color: '#F2F2F2',
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'FunnelDisplay_600SemiBold',
    textAlign: 'center'
  },
  placeholderText: {
    color: '#A0A0A0',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Manrope_500Medium',
    textAlign: 'center'
  }
});
