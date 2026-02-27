import React from 'react';
import { ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  categories: string[];
  selected: string;
  counts: Record<string, number>;
  onSelect: (value: string) => void;
}

export function CategoryFilterBar({ categories, selected, counts, onSelect }: Props) {
  return (
    <ScrollView horizontal style={styles.scroll} contentContainerStyle={styles.container} showsHorizontalScrollIndicator={false}>
      {categories.map((category) => {
        const isActive = selected === category;
        return (
          <Pressable
            key={category}
            style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
            onPress={() => onSelect(category)}
          >
            <Text style={[styles.chipText, isActive ? styles.textActive : styles.textInactive]}>{category}</Text>
            <View style={[styles.count, isActive ? styles.countActive : styles.countInactive]}>
              <Text style={[styles.countText, isActive ? styles.textActive : styles.textInactive]}>
                {counts[category] ?? 0}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 54
  },
  container: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center'
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  chipActive: {
    backgroundColor: '#E4FF5D',
    borderColor: '#E4FF5D'
  },
  chipInactive: {
    backgroundColor: '#18181B',
    borderColor: '#27272A'
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600'
  },
  textActive: {
    color: '#111111'
  },
  textInactive: {
    color: '#E4E4E7'
  },
  count: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2
  },
  countActive: {
    backgroundColor: '#11111111'
  },
  countInactive: {
    backgroundColor: '#2F2F33'
  },
  countText: {
    fontSize: 12,
    fontWeight: '700'
  }
});
