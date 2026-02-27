import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
    maxHeight: '70%'
  },
  title: {
    color: '#FAFAFA',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10
  },
  scroll: {
    maxHeight: 320
  },
  row: {
    borderRadius: 10,
    backgroundColor: '#1A1C23',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8
  },
  rowActive: {
    backgroundColor: '#233116'
  },
  rowText: {
    color: '#F5F5F5',
    fontWeight: '600'
  },
  rowTextActive: {
    color: '#E4FF5D'
  },
  close: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  closeText: {
    color: '#A1A1AA',
    fontWeight: '600'
  }
});
