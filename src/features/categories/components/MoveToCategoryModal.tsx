import React from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface Props {
  visible: boolean;
  categories: string[];
  currentCategory: string;
  onClose: () => void;
  onMove: (category: string) => void;
}

export function MoveToCategoryModal({ visible, categories, currentCategory, onClose, onMove }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Move to Category</Text>
          <ScrollView style={styles.scroll}>
            {categories.map((category) => {
              const isCurrent = category === currentCategory;
              return (
                <Pressable
                  key={category}
                  style={[styles.row, isCurrent && styles.rowActive]}
                  onPress={() => onMove(category)}
                >
                  <Text style={[styles.rowText, isCurrent && styles.rowTextActive]}>{category}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable style={styles.close} onPress={onClose}>
            <Text style={styles.closeText}>Cancel</Text>
          </Pressable>
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
    maxHeight: '70%'
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10
  },
  scroll: {
    maxHeight: 320
  },
  row: {
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    backgroundColor: '#191919',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8
  },
  rowActive: {
    backgroundColor: '#34121A',
    borderColor: '#81273B'
  },
  rowText: {
    color: '#D2D2D2',
    fontWeight: '600',
    fontSize: 14
  },
  rowTextActive: {
    color: '#FFFFFF'
  },
  close: {
    alignSelf: 'flex-end',
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  closeText: {
    color: '#A3A3A3',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' })
  }
});
