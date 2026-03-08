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
import { SvgXml } from 'react-native-svg';

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
  onVisitYouTube: () => void;
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

const EXTERNAL_LINK_ICON_XML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21 9.75C21 9.94891 20.921 10.1397 20.7803 10.2803C20.6397 10.421 20.4489 10.5 20.25 10.5C20.0511 10.5 19.8603 10.421 19.7197 10.2803C19.579 10.1397 19.5 9.94891 19.5 9.75V5.56125L13.2816 11.7806C13.1408 11.9214 12.95 12.0004 12.7509 12.0004C12.5519 12.0004 12.361 11.9214 12.2203 11.7806C12.0796 11.6399 12.0005 11.449 12.0005 11.25C12.0005 11.051 12.0796 10.8601 12.2203 10.7194L18.4387 4.5H14.25C14.0511 4.5 13.8603 4.42098 13.7197 4.28033C13.579 4.13968 13.5 3.94891 13.5 3.75C13.5 3.55109 13.579 3.36032 13.7197 3.21967C13.8603 3.07902 14.0511 3 14.25 3H20.25C20.4489 3 20.6397 3.07902 20.7803 3.21967C20.921 3.36032 21 3.55109 21 3.75V9.75ZM17.25 12C17.0511 12 16.8603 12.079 16.7197 12.2197C16.579 12.3603 16.5 12.5511 16.5 12.75V19.5H4.5V7.5H11.25C11.4489 7.5 11.6397 7.42098 11.7803 7.28033C11.921 7.13968 12 6.94891 12 6.75C12 6.55109 11.921 6.36032 11.7803 6.21967C11.6397 6.07902 11.4489 6 11.25 6H4.5C4.10218 6 3.72064 6.15804 3.43934 6.43934C3.15804 6.72064 3 7.10218 3 7.5V19.5C3 19.8978 3.15804 20.2794 3.43934 20.5607C3.72064 20.842 4.10218 21 4.5 21H16.5C16.8978 21 17.2794 20.842 17.5607 20.5607C17.842 20.2794 18 19.8978 18 19.5V12.75C18 12.5511 17.921 12.3603 17.7803 12.2197C17.6397 12.079 17.4489 12 17.25 12Z" fill="white"/>
</svg>`;

function ExternalLinkIcon() {
  return <SvgXml xml={EXTERNAL_LINK_ICON_XML} width={18} height={18} />;
}

export function HowItWorksModal({ visible, onClose, onTryItOut, onVisitYouTube }: Props) {
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
              <Text style={styles.tryButtonText}>Dismiss</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.visitYouTubeButton, pressed ? styles.visitYouTubeButtonPressed : null]}
              onPress={onVisitYouTube}
            >
              <View style={styles.visitYouTubeButtonContent}>
                <Text style={styles.visitYouTubeButtonText}>Visit YouTube</Text>
                <ExternalLinkIcon />
              </View>
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
    minHeight: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4E4E4E',
    backgroundColor: '#272727',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16
  },
  tryButtonPressed: {
    opacity: 0.86
  },
  visitYouTubeButton: {
    flex: 1,
    minWidth: 0,
    minHeight: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ED1A43',
    backgroundColor: 'rgba(255, 27, 71, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16
  },
  visitYouTubeButtonPressed: {
    opacity: 0.86
  },
  visitYouTubeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  tryButtonText: {
    color: '#D0D0D0',
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Manrope_600SemiBold'
  },
  visitYouTubeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Manrope_600SemiBold'
  }
});
