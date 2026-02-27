import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

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
    backgroundColor: '#000000AA',
    justifyContent: 'center',
    padding: 24
  },
  modal: {
    backgroundColor: '#111216',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#24262E',
    padding: 16,
    gap: 12
  },
  title: {
    color: '#FAFAFA',
    fontSize: 18,
    fontWeight: '700'
  },
  input: {
    borderRadius: 10,
    borderColor: '#2B2F3A',
    borderWidth: 1,
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10
  },
  cancel: {
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  cancelText: {
    color: '#A1A1AA',
    fontWeight: '600'
  },
  save: {
    backgroundColor: '#E4FF5D',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  saveText: {
    color: '#131313',
    fontWeight: '700'
  }
});
