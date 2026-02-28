import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { FlattenedVideo } from '../../../types/domain';
import type { MenuAnchorRect } from './TimestampCard';

interface Props {
  visible: boolean;
  anchor: MenuAnchorRect | null;
  video: FlattenedVideo | null;
  categories: string[];
  onClose: () => void;
  onMove: (category: string) => void;
  onDelete: () => void;
}

const MENU_WIDTH = 220;
const SCREEN_PADDING = 12;
const MENU_OFFSET = 6;
const MAX_CATEGORY_LIST_HEIGHT = 240;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function TimestampActionsMenu({
  visible,
  anchor,
  video,
  categories,
  onClose,
  onMove,
  onDelete
}: Props) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [menuHeight, setMenuHeight] = useState(0);

  const menuPosition = useMemo(() => {
    if (!anchor) {
      return { left: SCREEN_PADDING, top: SCREEN_PADDING };
    }

    const estimatedHeight = menuHeight || 220;
    const left = clamp(
      anchor.x + anchor.width - MENU_WIDTH,
      SCREEN_PADDING,
      Math.max(SCREEN_PADDING, screenWidth - MENU_WIDTH - SCREEN_PADDING)
    );

    const belowTop = anchor.y + anchor.height + MENU_OFFSET;
    const aboveTop = anchor.y - estimatedHeight - MENU_OFFSET;
    const preferredTop =
      belowTop + estimatedHeight <= screenHeight - SCREEN_PADDING ? belowTop : Math.max(SCREEN_PADDING, aboveTop);

    return {
      left,
      top: clamp(preferredTop, SCREEN_PADDING, Math.max(SCREEN_PADDING, screenHeight - estimatedHeight - SCREEN_PADDING))
    };
  }, [anchor, menuHeight, screenHeight, screenWidth]);

  if (!visible || !video) {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View
        style={[
          styles.menu,
          {
            left: menuPosition.left,
            top: menuPosition.top,
            width: Math.min(MENU_WIDTH, screenWidth - SCREEN_PADDING * 2)
          }
        ]}
        onLayout={(event) => setMenuHeight(event.nativeEvent.layout.height)}
      >
        <ScrollView
          style={styles.categoryList}
          contentContainerStyle={styles.categoryListContent}
          showsVerticalScrollIndicator={false}
        >
          {categories.map((category) => {
            const isSelected = video.category === category;

            return (
              <Pressable
                key={category}
                style={({ pressed }) => [styles.categoryOption, pressed ? styles.categoryOptionPressed : null]}
                onPress={() => {
                  if (isSelected) {
                    onClose();
                    return;
                  }

                  onMove(category);
                }}
              >
                <View style={styles.checkIcon}>
                  {isSelected ? (
                    <Svg width={10} height={6} viewBox="0 0 10 6">
                      <Path fill="#1FA700" d="M3.359 6L0 2.64l.947-.947 2.412 2.407L9.053 0 10 .947 3.359 6Z" />
                    </Svg>
                  ) : null}
                </View>
                <Text style={[styles.categoryText, isSelected ? styles.categoryTextSelected : null]}>{category}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.divider} />

        <Pressable
          style={({ pressed }) => [styles.deleteButton, pressed ? styles.deleteButtonPressed : null]}
          onPress={onDelete}
        >
          <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
            <Path
              d="M9.75 2.75L9.44015 7.76255C9.36095 9.0432 9.3214 9.68355 9.0004 10.144C8.84165 10.3716 8.63735 10.5637 8.40035 10.708C7.92105 11 7.2795 11 5.99635 11C4.71156 11 4.06915 11 3.58952 10.7075C3.3524 10.5629 3.148 10.3704 2.98934 10.1424C2.66844 9.6813 2.62972 9.04005 2.5523 7.7576L2.25 2.75"
              stroke="#FF4343"
              strokeWidth={0.826322}
              strokeLinecap="round"
            />
            <Path
              d="M1.5 2.75049H10.5M8.02785 2.75049L7.68655 2.04635C7.4598 1.57862 7.3464 1.34475 7.15085 1.19889C7.1075 1.16654 7.06155 1.13776 7.0135 1.11284C6.79695 1.00049 6.53705 1.00049 6.01725 1.00049C5.4844 1.00049 5.218 1.00049 4.99784 1.11755C4.94905 1.14349 4.90249 1.17344 4.85864 1.20707C4.66082 1.35884 4.55032 1.60126 4.32931 2.08612L4.02646 2.75049"
              stroke="#FF4343"
              strokeWidth={0.826322}
              strokeLinecap="round"
            />
            <Path
              d="M4.75 8.25049V5.25049"
              stroke="#FF4343"
              strokeWidth={0.826322}
              strokeLinecap="round"
            />
            <Path
              d="M7.25 8.25049V5.25049"
              stroke="#FF4343"
              strokeWidth={0.826322}
              strokeLinecap="round"
            />
          </Svg>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100
  },
  menu: {
    position: 'absolute',
    backgroundColor: '#191919',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    borderRadius: 14,
    padding: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10
  },
  categoryList: {
    maxHeight: MAX_CATEGORY_LIST_HEIGHT
  },
  categoryListContent: {
    gap: 2
  },
  categoryOption: {
    minHeight: 32,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  categoryOptionPressed: {
    backgroundColor: '#2B2B2B'
  },
  checkIcon: {
    width: 10,
    minWidth: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  categoryText: {
    flex: 1,
    color: '#D2D2D2',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Manrope_500Medium'
  },
  categoryTextSelected: {
    color: '#FFFFFF'
  },
  divider: {
    height: 1,
    backgroundColor: '#2D2D2D',
    marginVertical: 8
  },
  deleteButton: {
    minHeight: 32,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  deleteButtonPressed: {
    backgroundColor: 'rgba(255, 67, 67, 0.12)'
  },
  deleteText: {
    color: '#FF4343',
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'Manrope_500Medium'
  }
});
