import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

interface BrandMarkProps {
  size?: 'small' | 'large';
  style?: StyleProp<ViewStyle>;
}

const TEXT_SIZES = {
  small: 18,
  large: 56
};

const AMP_SIZES = {
  small: 20,
  large: 64
};

export function BrandMark({ size = 'small', style }: BrandMarkProps) {
  const textSize = TEXT_SIZES[size];
  const ampSize = AMP_SIZES[size];

  return (
    <View style={[styles.wrapper, style]}>
      <View>
        <Text style={[styles.word, { fontSize: textSize, lineHeight: textSize * 1.08 }]}>Save</Text>
        <Text style={[styles.word, { fontSize: textSize, lineHeight: textSize * 1.08 }]}>Resume</Text>
      </View>
      <Text style={[styles.ampersand, { fontSize: ampSize }]}>&</Text>
    </View>
  );
}

interface AppGlyphProps {
  size?: number;
}

export function AppGlyph({ size = 48 }: AppGlyphProps) {
  const barWidth = Math.round(size * 0.18);
  const barHeight = Math.round(size * 0.88);
  const iconHeight = Math.round(size * 0.68);
  const triangleSize = Math.round(size * 0.84);

  return (
    <View style={[styles.glyphContainer, { width: size, height: size }]}>
      <View style={styles.glyphBars}>
        <View style={[styles.glyphBar, { width: barWidth, height: barHeight }]} />
        <View style={[styles.glyphBar, { width: barWidth, height: barHeight }]} />
      </View>
      <View
        style={[
          styles.playTriangle,
          {
            borderTopWidth: triangleSize / 2,
            borderBottomWidth: triangleSize / 2,
            borderLeftWidth: iconHeight
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  word: {
    color: '#F8F8F8',
    fontWeight: '700',
    textAlign: 'center'
  },
  ampersand: {
    position: 'absolute',
    color: '#ED1A43',
    fontWeight: '700'
  },
  glyphContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  glyphBars: {
    flexDirection: 'row',
    gap: 4
  },
  glyphBar: {
    borderRadius: 3,
    backgroundColor: '#F4F4F5'
  },
  playTriangle: {
    position: 'absolute',
    left: 1,
    width: 0,
    height: 0,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#ED1A43'
  }
});
