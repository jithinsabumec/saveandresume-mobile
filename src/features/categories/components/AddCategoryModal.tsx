import React, { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export function AddCategoryModal({ visible, onClose, onSubmit }: Props) {
  const [value, setValue] = useState('');

  const submit = () => {
    onSubmit(value);
    setValue('');
  };

  const close = () => {
    setValue('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Create Category</Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="Category name"
            placeholderTextColor="#6B7280"
            style={styles.input}
            autoCapitalize="words"
          />
          <View style={styles.actions}>
            <Pressable style={styles.cancel} onPress={close}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.save} onPress={submit}>
              <Text style={styles.saveText}>Save</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 24
  },
  modal: {
    backgroundColor: '#1D1D1D',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#363636',
    padding: 16,
    gap: 12
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  input: {
    borderRadius: 8,
    borderColor: '#2D2D2D',
    borderWidth: 1,
    backgroundColor: '#141414',
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    lineHeight: 20
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 16
  },
  cancel: {
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  cancelText: {
    color: '#A3A3A3',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' })
  },
  save: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ED1A43',
    backgroundColor: 'rgba(255, 27, 71, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' })
  }
});
