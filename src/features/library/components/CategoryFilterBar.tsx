import React from 'react';
import { ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface Props {
  categories: string[];
  selected: string;
  counts: Record<string, number>;
  onSelect: (value: string) => void;
  editMode?: boolean;
  lockedCategories?: string[];
  onDeleteCategory?: (value: string) => void;
}

export function CategoryFilterBar({
  categories,
  selected,
  counts,
  onSelect,
  editMode = false,
  lockedCategories = [],
  onDeleteCategory
}: Props) {
  const locked = new Set(lockedCategories);
  const chips = categories.map((category) => {
    const isActive = selected === category;
    const canDelete = editMode && !locked.has(category) && Boolean(onDeleteCategory);

    return (
      <Pressable
        key={category}
        style={[
          styles.chip,
          isActive ? styles.chipActive : styles.chipInactive,
          canDelete ? styles.chipEditing : null
        ]}
        onPress={() => onSelect(category)}
      >
        <Text style={[styles.chipText, isActive ? styles.textActive : styles.textInactive]}>{category}</Text>
        <View style={[styles.count, isActive ? styles.countActive : styles.countInactive]}>
          <Text style={[styles.countText, isActive ? styles.textActive : styles.textInactive]}>
            {counts[category] ?? 0}
          </Text>
        </View>
        {canDelete ? (
          <Pressable
            style={({ pressed }) => [styles.deleteButton, pressed ? styles.deleteButtonPressed : null]}
            onPress={(event) => {
              event.stopPropagation();
              onDeleteCategory?.(category);
            }}
            hitSlop={8}
          >
            {({ pressed }) => (
              <Svg width={12} height={12} viewBox="0 0 256 256">
                <Path
                  fill={pressed ? '#FFFFFF' : '#AAAAAA'}
                  d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"
                />
              </Svg>
            )}
          </Pressable>
        ) : null}
      </Pressable>
    );
  });

  if (editMode) {
    return <View style={styles.editContainer}>{chips}</View>;
  }

  return (
    <ScrollView
      horizontal
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsHorizontalScrollIndicator={false}
    >
      {chips}
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
  editContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
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
  chipEditing: {
    paddingRight: 6.5
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
  },
  deleteButton: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
    padding: 0
  },
  deleteButtonPressed: {
    backgroundColor: '#454545',
    borderRadius: 30
  }
});
