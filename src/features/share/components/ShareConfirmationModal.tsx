import React from 'react';
import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onCancel} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.heading}>Save Timestamp</Text>

          <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
          <Text style={styles.title} numberOfLines={2}>{title || 'YouTube video'}</Text>
          <View style={styles.timeRow}>
            <Text style={styles.timeIcon}>[]</Text>
            <Text style={styles.time}>{formattedTime}</Text>
          </View>

          {loadingMetadata ? (
            <View style={styles.loaderRow}>
              <ActivityIndicator color="#ED1A43" />
              <Text style={styles.loaderText}>Loading video metadata...</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Pressable style={styles.dismissButton} onPress={onCancel} disabled={saving}>
              <Text style={styles.dismissText}>DISMISS</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={onConfirm} disabled={saving || loadingMetadata}>
              {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveText}>SAVE</Text>}
            </Pressable>
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
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#363636'
  },
  handle: {
    width: 46,
    height: 4,
    borderRadius: 100,
    backgroundColor: '#282828',
    alignSelf: 'center',
    marginBottom: 20
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 25,
    marginBottom: 12,
    textAlign: 'center'
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    backgroundColor: '#242424'
  },
  title: {
    color: '#F1F1F1',
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '600',
    marginTop: 12
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8
  },
  timeIcon: {
    color: '#7C7C7C',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700'
  },
  time: {
    color: '#7C7C7C',
    fontSize: 14,
    lineHeight: 20.3,
    fontFamily: 'Manrope_500Medium'
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10
  },
  loaderText: {
    color: '#9A9AA2'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 16,
    marginTop: 18
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
    fontFamily: 'Manrope_500Medium'
  },
  saveButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ED1A43',
    backgroundColor: 'rgba(255, 27, 71, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 77,
    alignItems: 'center',
    justifyContent: 'center'
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'Manrope_500Medium'
  }
});
