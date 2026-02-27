import React from 'react';
import { Image, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  visible: boolean;
  title: string;
  thumbnailUrl: string;
  onDismiss: () => void;
  onGoToYoutube: () => void;
}

export function MissingTimestampDialog({ visible, title, thumbnailUrl, onDismiss, onGoToYoutube }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.warningBadge}>
              <Text style={styles.warningBadgeText}>!</Text>
            </View>
            <Text style={styles.heading}>Timestamp Not Captured</Text>
          </View>

          <View style={styles.previewCard}>
            <Image source={{ uri: thumbnailUrl }} style={styles.previewThumb} />
            <View style={styles.previewBody}>
              <Text style={styles.previewTitle} numberOfLines={3}>{title || 'YouTube video'}</Text>
              <View style={styles.previewMeta}>
                <Text style={styles.previewMetaIcon}>[]</Text>
                <Text style={styles.previewMetaText}>00:00</Text>
              </View>
            </View>
            <Text style={styles.moreText}>...</Text>
          </View>

          <View style={styles.savedAs}>
            <Text style={styles.savedAsText}>The timestamp is saved as</Text>
            <View style={styles.savedAsRow}>
              <Text style={styles.savedAsIcon}>[]</Text>
              <Text style={styles.savedAsTime}>00:00</Text>
              <Text style={styles.savedAsText}>by default</Text>
            </View>
          </View>

          <View style={styles.tipBox}>
            <Text style={styles.tipText}>
              To save the exact moment, go back to YouTube,{' '}
              <Text style={styles.tipEmphasis}>enable the “Start at” toggle</Text>
              , and then <Text style={styles.tipEmphasis}>tap “Share” again.</Text>
            </Text>
          </View>

          <View style={styles.screenshotMock}>
            <View style={styles.mockToggle} />
            <View style={styles.mockDivider} />
            <Text style={styles.mockCaption}>YouTube "Start at" toggle preview</Text>
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.dismissButton} onPress={onDismiss}>
              <Text style={styles.dismissText}>DISMISS</Text>
            </Pressable>
            <Pressable style={styles.youtubeButton} onPress={onGoToYoutube}>
              <Text style={styles.youtubeText}>GO TO YOUTUBE</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    padding: 16,
    gap: 16
  },
  header: {
    alignItems: 'center',
    gap: 6
  },
  warningBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFB70022',
    alignItems: 'center',
    justifyContent: 'center'
  },
  warningBadgeText: {
    color: '#FFB700',
    fontSize: 36,
    lineHeight: 36,
    fontWeight: '700'
  },
  heading: {
    color: '#FFB700',
    fontSize: 16,
    lineHeight: 25,
    fontWeight: '600'
  },
  previewCard: {
    borderRadius: 9.5,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    backgroundColor: '#191919',
    padding: 8.6,
    flexDirection: 'row',
    alignItems: 'center'
  },
  previewThumb: {
    width: 129.2,
    height: 79.3,
    borderRadius: 5.4,
    backgroundColor: '#101010'
  },
  previewBody: {
    flex: 1,
    minHeight: 79.3,
    justifyContent: 'space-between',
    paddingLeft: 8.6,
    paddingRight: 8
  },
  previewTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20.3,
    fontWeight: '600'
  },
  previewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  previewMetaIcon: {
    color: '#7C7C7C',
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '700'
  },
  previewMetaText: {
    color: '#7C7C7C',
    fontSize: 12,
    lineHeight: 20.3
  },
  moreText: {
    color: '#AFAFB6',
    fontSize: 12,
    lineHeight: 12,
    fontWeight: '700'
  },
  savedAs: {
    alignItems: 'center'
  },
  savedAsText: {
    color: '#979797',
    fontSize: 16,
    lineHeight: 25,
    fontWeight: '500'
  },
  savedAsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  savedAsIcon: {
    color: '#FFFFFF',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700'
  },
  savedAsTime: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 20.3,
    fontWeight: '500',
    fontFamily: mono
  },
  tipBox: {
    borderRadius: 9,
    backgroundColor: '#2D2D2D',
    padding: 12
  },
  tipText: {
    color: '#979797',
    fontSize: 14,
    lineHeight: 20
  },
  tipEmphasis: {
    color: '#FFFFFF'
  },
  screenshotMock: {
    height: 146,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12
  },
  mockToggle: {
    width: 56,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4D4D4D'
  },
  mockDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#303030'
  },
  mockCaption: {
    color: '#7A7A7A',
    fontSize: 13
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dismissButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  dismissText: {
    color: '#A3A3A3',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: mono
  },
  youtubeButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ED1A43',
    backgroundColor: 'rgba(255, 27, 71, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  youtubeText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: mono
  }
});
