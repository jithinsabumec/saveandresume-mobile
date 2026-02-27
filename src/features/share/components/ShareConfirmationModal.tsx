import React from 'react';
import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

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
  videoId,
  title,
  thumbnailUrl,
  formattedTime,
  note,
  loadingMetadata,
  saving,
  onChangeNote,
  onCancel,
  onConfirm
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.heading}>Save Timestamp</Text>

          <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <Text style={styles.videoId}>Video ID: {videoId}</Text>
          <Text style={styles.time}>Timestamp: {formattedTime}</Text>

          <TextInput
            value={note}
            onChangeText={onChangeNote}
            placeholder="Add an optional note"
            placeholderTextColor="#6B7280"
            style={styles.noteInput}
            editable={!saving}
          />

          {loadingMetadata ? (
            <View style={styles.loaderRow}>
              <ActivityIndicator color="#E4FF5D" />
              <Text style={styles.loaderText}>Loading video metadata...</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Pressable style={styles.cancel} onPress={onCancel} disabled={saving}>
              <Text style={styles.cancelText}>Dismiss</Text>
            </Pressable>
            <Pressable style={styles.confirm} onPress={onConfirm} disabled={saving || loadingMetadata}>
              {saving ? <ActivityIndicator color="#111" /> : <Text style={styles.confirmText}>Save</Text>}
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
    justifyContent: 'flex-end',
    backgroundColor: '#00000099'
  },
  sheet: {
    backgroundColor: '#121317',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#282B35',
    gap: 8
  },
  heading: {
    color: '#FAFAFA',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4
  },
  thumbnail: {
    width: '100%',
    height: 170,
    borderRadius: 12,
    backgroundColor: '#242424'
  },
  title: {
    color: '#F1F5F9',
    fontSize: 15,
    fontWeight: '600'
  },
  time: {
    color: '#A1A1AA',
    fontSize: 14
  },
  videoId: {
    color: '#9CA3AF',
    fontSize: 12
  },
  noteInput: {
    borderRadius: 10,
    borderColor: '#2B2F3A',
    borderWidth: 1,
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginTop: 2
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2
  },
  loaderText: {
    color: '#9CA3AF'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12
  },
  cancel: {
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  cancelText: {
    color: '#A1A1AA',
    fontWeight: '600'
  },
  confirm: {
    backgroundColor: '#E4FF5D',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    minWidth: 88,
    alignItems: 'center'
  },
  confirmText: {
    color: '#121212',
    fontWeight: '700'
  }
});
