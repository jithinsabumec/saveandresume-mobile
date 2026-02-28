import React from 'react';
import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { ShareModalTimestampIcon } from '../../../components/FigmaIcons';

interface Props {
  visible: boolean;
  videoId: string;
  title: string;
  thumbnailUrl: string;
  formattedTime: string;
  note: string;
  loadingMetadata: boolean;
  saving: boolean;
  onChangeNote: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ShareConfirmationModal({
  visible,
  title,
  thumbnailUrl,
  formattedTime,
  loadingMetadata,
  saving,
  onCancel,
  onConfirm
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onCancel} disabled={saving} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.content}>
            <Text style={styles.heading}>Save Timestamp</Text>

            <View style={styles.previewBlock}>
              {thumbnailUrl ? (
                <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
              ) : (
                <View style={[styles.thumbnail, styles.thumbnailFallback]} />
              )}

              <View style={styles.textBlock}>
                <Text style={styles.title} numberOfLines={2}>
                  {title || 'YouTube video'}
                </Text>

                <View style={styles.timeRow}>
                  <ShareModalTimestampIcon width={14} height={14} />
                  <Text style={styles.time}>{formattedTime}</Text>
                </View>
              </View>
            </View>

            {loadingMetadata ? (
              <View style={styles.loaderRow}>
                <ActivityIndicator color="#ED1A43" />
                <Text style={styles.loaderText}>Loading video metadata...</Text>
              </View>
            ) : null}

            <View style={styles.actions}>
              <Pressable
                style={({ pressed }) => [styles.dismissButton, pressed ? styles.dismissButtonPressed : null]}
                onPress={onCancel}
                disabled={saving}
              >
                <Text style={styles.dismissText}>DISMISS</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.saveButton,
                  (saving || loadingMetadata) ? styles.saveButtonDisabled : null,
                  pressed && !(saving || loadingMetadata) ? styles.saveButtonPressed : null
                ]}
                onPress={onConfirm}
                disabled={saving || loadingMetadata}
              >
                {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveText}>SAVE</Text>}
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
    justifyContent: 'flex-end'
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  sheet: {
    backgroundColor: '#1D1D1D',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: '#363636',
    paddingTop: 8,
    paddingHorizontal: 24,
    paddingBottom: 28
  },
  handle: {
    width: 46,
    height: 4,
    borderRadius: 100,
    backgroundColor: '#282828',
    alignSelf: 'center'
  },
  content: {
    marginTop: 16,
    gap: 28
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 25,
    textAlign: 'center',
    fontFamily: 'Manrope_600SemiBold'
  },
  previewBlock: {
    gap: 12
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 1280 / 720,
    borderRadius: 12,
    backgroundColor: '#242424'
  },
  thumbnailFallback: {
    borderWidth: 1,
    borderColor: '#303030'
  },
  textBlock: {
    gap: 8
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 25,
    fontFamily: 'Manrope_600SemiBold'
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  time: {
    color: '#7C7C7C',
    fontSize: 14,
    lineHeight: 20.292,
    fontFamily: 'SpaceMono_400Regular'
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  loaderText: {
    color: '#9A9AA2',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Manrope_500Medium'
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
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
  saveButton: {
    minWidth: 78,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ED1A43',
    backgroundColor: 'rgba(255, 27, 71, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  saveButtonPressed: {
    backgroundColor: 'rgba(255, 27, 71, 0.55)'
  },
  saveButtonDisabled: {
    opacity: 0.7
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'SpaceMono_400Regular',
    textTransform: 'uppercase'
  }
});
