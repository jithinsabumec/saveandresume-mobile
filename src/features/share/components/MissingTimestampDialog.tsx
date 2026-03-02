import { ResizeMode, Video } from 'expo-av';
import React, { useEffect, useRef } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import {
  HomeCardMenuIcon,
  HomeTimestampIcon,
  MissingTimestampWarningIcon
} from '../../../components/FigmaIcons';

interface Props {
  visible: boolean;
  title: string;
  thumbnailUrl: string;
  onDismiss: () => void;
  onGoToYoutube: () => void;
}

const previewVideoSource = require('../../../../timestamp-not-added.mp4');

function SavedTimestampIcon({ color = '#FFFFFF', size = 14 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 10 10" fill="none">
      <Path
        d="M1.66675 7.49216V4.04497C1.66675 2.53106 1.66675 1.77411 2.1549 1.3038C2.64306 0.833496 3.42873 0.833496 5.00008 0.833496C6.57141 0.833496 7.35712 0.833496 7.84525 1.3038C8.33341 1.77411 8.33342 2.53106 8.33342 4.04497V7.49216C8.33342 8.45295 8.33341 8.93333 8.01141 9.10529C7.38779 9.43825 6.21808 8.32733 5.66258 7.99283C5.34041 7.79883 5.17933 7.70183 5.00008 7.70183C4.82083 7.70183 4.65975 7.79883 4.33758 7.99283C3.78208 8.32733 2.61236 9.43825 1.98877 9.10529C1.66675 8.93333 1.66675 8.45295 1.66675 7.49216Z"
        stroke={color}
        strokeWidth={0.710205}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function MissingTimestampDialog({ visible, title, thumbnailUrl, onDismiss, onGoToYoutube }: Props) {
  const videoRef = useRef<Video | null>(null);

  useEffect(() => {
    const syncPreviewPlayback = async () => {
      const video = videoRef.current;
      if (!video) {
        return;
      }

      try {
        if (visible) {
          await video.replayAsync();
          return;
        }

        await video.stopAsync();
      } catch {
        // Ignore transient playback errors while the modal mounts or hides.
      }
    };

    void syncPreviewPlayback();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.content}>
            <View style={styles.header}>
              <MissingTimestampWarningIcon width={60} height={60} />
              <Text style={styles.heading}>Timestamp Not Captured</Text>
            </View>

            <View style={styles.body}>
              <View style={styles.cardSection}>
                <View style={styles.previewCard}>
                  {thumbnailUrl ? (
                    <View style={styles.thumbnailShadow}>
                      <Image source={{ uri: thumbnailUrl }} style={styles.previewThumb} />
                    </View>
                  ) : (
                    <View style={[styles.previewThumb, styles.previewThumbFallback]} />
                  )}

                  <View style={styles.previewBody}>
                    <Text style={styles.previewTitle} numberOfLines={3}>
                      {title || 'YouTube video'}
                    </Text>

                    <View style={styles.previewFooter}>
                      <View style={styles.previewMeta}>
                        <HomeTimestampIcon width={10} height={10} />
                        <Text style={styles.previewMetaText}>00:00</Text>
                      </View>

                      <HomeCardMenuIcon width={25.25} height={28} />
                    </View>
                  </View>
                </View>

                <View style={styles.savedAs}>
                  <Text style={styles.savedAsLabel}>The timestamp is saved as</Text>

                  <View style={styles.savedAsRow}>
                    <View style={styles.savedAsTimeGroup}>
                      <SavedTimestampIcon />
                      <Text style={styles.savedAsTime}>00:00</Text>
                    </View>

                    <Text style={styles.savedAsSuffix}>by default</Text>
                  </View>
                </View>
              </View>

              <View style={styles.tipSection}>
                <View style={styles.tipBox}>
                  <Text style={styles.tipText}>
                    To save the exact moment, go back to YouTube,{' '}
                    <Text style={styles.tipStrong}>enable the “Start at” toggle</Text>, and then{' '}
                    <Text style={styles.tipStrong}>tap “Share” again.</Text>
                  </Text>
                </View>

                <View style={styles.videoShadow}>
                  <View style={styles.videoFrame}>
                    <Video
                      ref={videoRef}
                      style={styles.video}
                      source={previewVideoSource}
                      shouldPlay={visible}
                      isLooping
                      isMuted
                      useNativeControls={false}
                      resizeMode={ResizeMode.COVER}
                    />
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.actions}>
              <Pressable style={({ pressed }) => [styles.dismissButton, pressed ? styles.dismissButtonPressed : null]} onPress={onDismiss}>
                <Text style={styles.dismissText}>DISMISS</Text>
              </Pressable>

              <Pressable style={({ pressed }) => [styles.youtubeButton, pressed ? styles.youtubeButtonPressed : null]} onPress={onGoToYoutube}>
                <Text style={styles.youtubeText}>GO TO YOUTUBE</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  modal: {
    width: '100%',
    maxWidth: 342,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#363636',
    backgroundColor: '#1D1D1D',
    padding: 16
  },
  content: {
    width: '100%',
    gap: 32,
    alignItems: 'center'
  },
  header: {
    alignItems: 'center',
    gap: 6
  },
  heading: {
    color: '#FFB700',
    fontSize: 16,
    lineHeight: 25,
    fontFamily: 'Manrope_600SemiBold'
  },
  body: {
    width: '100%',
    gap: 36
  },
  cardSection: {
    width: '100%',
    gap: 8,
    alignItems: 'center'
  },
  previewCard: {
    width: '100%',
    minHeight: 98.5,
    borderRadius: 9.47,
    borderWidth: 1.194,
    borderColor: '#2D2D2D',
    backgroundColor: '#191919',
    paddingHorizontal: 8.6,
    paddingVertical: 9.47,
    flexDirection: 'row',
    alignItems: 'center'
  },
  thumbnailShadow: {
    borderRadius: 5.371,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 52.785,
    shadowOffset: { width: 0, height: 4.181 },
    elevation: 2
  },
  previewThumb: {
    width: 129.171,
    height: 79.315,
    borderRadius: 5.371,
    backgroundColor: '#101010'
  },
  previewThumbFallback: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#272727'
  },
  previewBody: {
    flex: 1,
    minHeight: 79.315,
    paddingLeft: 8.6,
    justifyContent: 'space-between'
  },
  previewTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20.292,
    fontFamily: 'Manrope_600SemiBold'
  },
  previewFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between'
  },
  previewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  previewMetaText: {
    color: '#7C7C7C',
    fontSize: 12,
    lineHeight: 20.292,
    fontFamily: 'SpaceMono_400Regular'
  },
  savedAs: {
    alignItems: 'center',
    paddingBottom: 2
  },
  savedAsLabel: {
    color: '#979797',
    fontSize: 16,
    lineHeight: 25,
    fontFamily: 'Manrope_500Medium'
  },
  savedAsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  savedAsTimeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  savedAsTime: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 20.292,
    fontFamily: 'SpaceMono_400Regular'
  },
  savedAsSuffix: {
    color: '#979797',
    fontSize: 16,
    lineHeight: 25,
    fontFamily: 'Manrope_500Medium'
  },
  tipSection: {
    width: '100%',
    gap: 8
  },
  tipBox: {
    borderRadius: 9,
    backgroundColor: '#2D2D2D',
    padding: 12
  },
  tipText: {
    color: '#979797',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Manrope_500Medium'
  },
  tipStrong: {
    color: '#FFFFFF',
    fontFamily: 'Manrope_500Medium'
  },
  videoShadow: {
    width: '100%',
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 17.9,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5
  },
  videoFrame: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    backgroundColor: '#050505',
    overflow: 'hidden'
  },
  video: {
    width: '100%',
    height: '100%'
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16
  },
  dismissButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  dismissButtonPressed: {
    backgroundColor: '#252525'
  },
  dismissText: {
    color: '#A3A3A3',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'SpaceMono_400Regular',
    textTransform: 'uppercase'
  },
  youtubeButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ED1A43',
    backgroundColor: 'rgba(255, 27, 71, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  youtubeButtonPressed: {
    backgroundColor: 'rgba(255, 27, 71, 0.55)'
  },
  youtubeText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'SpaceMono_400Regular',
    textTransform: 'uppercase'
  }
});
