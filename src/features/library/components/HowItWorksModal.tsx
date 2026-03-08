import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import {
  HOW_IT_WORKS_POSTER_SOURCE,
  HOW_IT_WORKS_VIDEO_ASPECT_RATIO,
  HOW_IT_WORKS_VIDEO_SOURCE
} from '../../../config/onboarding';
import { HowItWorksMedia } from './HowItWorksMedia';

interface Props {
  visible: boolean;
  onClose: () => void;
  onTryItOut: () => void;
}

const CLOSE_DRAG_DISTANCE = 120;
const CLOSE_DRAG_VELOCITY = 1.1;
const CLOSE_TRANSLATE_Y = 420;

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
  const [hasVideoError, setHasVideoError] = useState(false);
  const sheetTranslateY = useRef(new Animated.Value(0)).current;
  const isClosingRef = useRef(false);

  useEffect(() => {
    if (visible) {
      setHasVideoError(false);
      isClosingRef.current = false;
      sheetTranslateY.setValue(0);
    }
  }, [sheetTranslateY, visible]);

  const closeByDrag = useCallback(() => {
    if (isClosingRef.current) {
      return;
    }

    isClosingRef.current = true;
    Animated.timing(sheetTranslateY, {
      toValue: CLOSE_TRANSLATE_Y,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start(() => {
      sheetTranslateY.setValue(0);
      isClosingRef.current = false;
      onClose();
    });
  }, [onClose, sheetTranslateY]);

  const resetSheetPosition = useCallback(() => {
    Animated.spring(sheetTranslateY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 0
    }).start();
  }, [sheetTranslateY]);

  const handlePanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          gestureState.dy > 6 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onMoveShouldSetPanResponderCapture: () => false,
        onPanResponderGrant: () => {
          sheetTranslateY.stopAnimation();
        },
        onPanResponderMove: (_, gestureState) => {
          sheetTranslateY.setValue(Math.max(0, gestureState.dy));
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > CLOSE_DRAG_DISTANCE || gestureState.vy > CLOSE_DRAG_VELOCITY) {
            closeByDrag();
            return;
          }
          resetSheetPosition();
        },
        onPanResponderTerminate: resetSheetPosition
      }),
    [closeByDrag, resetSheetPosition, sheetTranslateY]
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={styles.backdropTapZone} onPress={onClose} />

        <Animated.View style={[styles.panel, { transform: [{ translateY: sheetTranslateY }] }]}>
          <View style={styles.handleTouchArea} {...handlePanResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.contentScrollInner}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.mediaSection}>
              <Text style={styles.heading}>How it works</Text>

              <View style={styles.mediaWrap}>
                <HowItWorksMedia
                  source={HOW_IT_WORKS_VIDEO_SOURCE}
                  posterSource={HOW_IT_WORKS_POSTER_SOURCE}
                  aspectRatio={HOW_IT_WORKS_VIDEO_ASPECT_RATIO}
                  shouldPlay={visible && !hasVideoError}
                  hasVideoError={hasVideoError}
                  onVideoError={() => setHasVideoError(true)}
                />
              </View>
            </View>

            <View style={styles.stepsSection}>
              <View style={styles.steps}>
                <View style={styles.stepsRow}>
                  <StepCard step="STEP 1" text="Open any YouTube video" width={120} />
                  <StepCard step="STEP 2" text="Tap share and select Save & Resume" width={140} />
                </View>
                <StepCard step="STEP 3" text="Your timestamp is saved" width={162} />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={({ pressed }) => [styles.tryButton, pressed ? styles.tryButtonPressed : null]}
              onPress={onTryItOut}
            >
              <Text style={styles.tryButtonText}>Try it out</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.dismissButton, pressed ? styles.dismissButtonPressed : null]}
              onPress={onClose}
            >
              <Text style={styles.dismissButtonText}>Dismiss</Text>
            </Pressable>
          </View>
        </Animated.View>
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
    width: '100%',
    maxHeight: '88%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#141414',
    alignItems: 'center',
    overflow: 'hidden'
  },
  handleTouchArea: {
    width: '100%',
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 6
  },
  handle: {
    width: 60,
    height: 4,
    borderRadius: 40,
    backgroundColor: '#383838'
  },
  contentScroll: {
    width: '100%',
    flexGrow: 0
  },
  contentScrollInner: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12
  },
  mediaSection: {
    width: '100%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 12
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 22,
    fontFamily: 'FunnelDisplay_600SemiBold',
    textAlign: 'center'
  },
  mediaWrap: {
    width: '100%',
    maxWidth: 300,
    alignSelf: 'center'
  },
  stepsSection: {
    width: '100%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 14
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
  footer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 30,
    backgroundColor: '#141414',
    gap: 10
  },
  tryButton: {
    flex: 1,
    minWidth: 0,
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
  dismissButton: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4E4E4E',
    backgroundColor: '#272727',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16
  },
  dismissButtonPressed: {
    opacity: 0.86
  },
  tryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'Manrope_600SemiBold'
  },
  dismissButtonText: {
    color: '#D0D0D0',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'Manrope_600SemiBold'
  }
});
