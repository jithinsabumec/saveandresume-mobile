import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  HOW_IT_WORKS_VIDEO_ASPECT_RATIO,
  HOW_IT_WORKS_VIDEO_SOURCE
} from '../../../config/onboarding';
import { HowItWorksMedia } from './HowItWorksMedia';

interface Props {
  visible: boolean;
  onClose: () => void;
  onTryItOut: () => void;
}

function StepCard({ step, text, width }: { step: string; text: string; width: number }) {
  return (
    <View style={[styles.stepCard, { width }]}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>{step}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

export function HowItWorksModal({ visible, onClose, onTryItOut }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={styles.backdropTapZone} onPress={onClose} />

        <View style={styles.panel}>
          <View style={styles.handle} />
          <Text style={styles.heading}>How it works</Text>

          <HowItWorksMedia
            source={HOW_IT_WORKS_VIDEO_SOURCE}
            aspectRatio={HOW_IT_WORKS_VIDEO_ASPECT_RATIO}
            shouldPlay={visible}
          />

          <View style={styles.steps}>
            <View style={styles.stepsRow}>
              <StepCard step="STEP 1" text="Open any YouTube video" width={120} />
              <StepCard step="STEP 2" text="Tap share and select Save & Resume" width={140} />
            </View>
            <StepCard step="STEP 3" text="Your timestamp is saved" width={162} />
          </View>

          <Pressable
            style={({ pressed }) => [styles.tryButton, pressed ? styles.tryButtonPressed : null]}
            onPress={onTryItOut}
          >
            <Text style={styles.tryButtonText}>Try it out</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end'
  },
  backdropTapZone: {
    flex: 1
  },
  panel: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 390,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#2F2F2F',
    backgroundColor: '#141414',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    gap: 16
  },
  handle: {
    width: 60,
    height: 4,
    borderRadius: 40,
    backgroundColor: '#383838'
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 22,
    fontFamily: 'FunnelDisplay_600SemiBold',
    textAlign: 'center'
  },
  steps: {
    alignItems: 'center',
    gap: 24
  },
  stepsRow: {
    flexDirection: 'row',
    gap: 24
  },
  stepCard: {
    alignItems: 'center',
    gap: 4
  },
  stepBadge: {
    height: 24,
    minWidth: 68,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4E4E4E',
    backgroundColor: '#272727',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.44,
    fontFamily: 'FunnelDisplay_600SemiBold'
  },
  stepText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'Manrope_600SemiBold',
    textAlign: 'center'
  },
  tryButton: {
    width: '100%',
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ED1A43',
    backgroundColor: 'rgba(255, 27, 71, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16
  },
  tryButtonPressed: {
    opacity: 0.86
  },
  tryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'Manrope_600SemiBold'
  }
});
