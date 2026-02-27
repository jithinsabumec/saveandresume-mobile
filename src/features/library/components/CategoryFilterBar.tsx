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
    <ScrollView
      horizontal
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsHorizontalScrollIndicator={false}
    >
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
    maxHeight: 36
  },
  container: {
    paddingHorizontal: 16,
    gap: 4.8,
    alignItems: 'center'
  },
  chip: {
    height: 28.4,
    borderRadius: 32,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.8,
    justifyContent: 'center',
    paddingLeft: 10.6,
    paddingRight: 7.1
  },
  chipActive: {
    backgroundColor: '#83112E',
    borderColor: '#C61743'
  },
  chipInactive: {
    backgroundColor: '#191919',
    borderColor: '#2D2D2D'
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Manrope_600SemiBold',
    lineHeight: 21.3
  },
  textActive: {
    color: '#FFFFFF'
  },
  textInactive: {
    color: '#D2D2D2'
  },
  count: {
    minWidth: 22.5,
    height: 14.2,
    borderRadius: 12,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center'
  },
  countActive: {
    backgroundColor: '#B82C4F'
  },
  countInactive: {
    backgroundColor: '#2D2D2D'
  },
  countText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '600',
    fontFamily: 'Manrope_600SemiBold'
  }
});
