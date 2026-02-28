import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export function AddCategoryModal({ visible, onClose, onSubmit }: Props) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!visible) {
      setValue('');
    }
  }, [visible]);

  const close = () => {
    setValue('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Add New Category</Text>
            <Pressable style={styles.closeButton} onPress={close} hitSlop={10}>
              <Svg width={18} height={18} viewBox="0 0 256 256">
                <Path
                  fill="#7C7C7C"
                  d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"
                />
              </Svg>
            </Pressable>
          </View>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="Category name"
            placeholderTextColor="#6B7280"
            style={styles.input}
            autoCapitalize="words"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => onSubmit(value)}
          />
          <View style={styles.actions}>
            <Pressable style={styles.cancel} onPress={close}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.save} onPress={() => onSubmit(value)}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 24
  },
  modal: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#191919',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    padding: 20,
    gap: 12
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'Manrope_600SemiBold'
  },
  closeButton: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  input: {
    borderRadius: 4,
    borderColor: '#393838',
    borderWidth: 1,
    backgroundColor: '#242424',
    color: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: 'Manrope_500Medium'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    marginTop: 4
  },
  cancel: {
    backgroundColor: '#242424',
    borderWidth: 1,
    borderColor: '#393838',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  cancelText: {
    color: '#B8B8B8',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Manrope_500Medium'
  },
  save: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ED1A43',
    backgroundColor: '#781D2F',
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Manrope_500Medium'
  }
});
