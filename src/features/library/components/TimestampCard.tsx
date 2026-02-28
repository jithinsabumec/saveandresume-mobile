import React, { useRef } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { HomeCardMenuIcon, HomeTimestampIcon } from '../../../components/FigmaIcons';
import type { FlattenedVideo } from '../../../types/domain';
import { formatTime } from '../../../utils/formatTime';

export interface MenuAnchorRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  item: FlattenedVideo;
  onOpen: (video: FlattenedVideo) => void;
  onOpenMenu: (video: FlattenedVideo, anchor: MenuAnchorRect) => void;
}

export function TimestampCard({ item, onOpen, onOpenMenu }: Props) {
  const menuButtonRef = useRef<View>(null);

  const openActions = () => {
    menuButtonRef.current?.measureInWindow((x, y, width, height) => {
      onOpenMenu(item, { x, y, width, height });
    });
  };

  return (
    <View style={styles.card}>
      <Pressable style={styles.touchArea} onPress={() => onOpen(item)}>
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>{item.title || 'Untitled video'}</Text>
          <View style={styles.metaRow}>
            <HomeTimestampIcon width={10} height={10} />
            <Text style={styles.meta}>{formatTime(item.currentTime)}</Text>
          </View>
        </View>
      </Pressable>

      <View collapsable={false} ref={menuButtonRef} style={styles.menuButtonAnchor}>
        <Pressable style={styles.menuButton} onPress={openActions} hitSlop={10}>
          <HomeCardMenuIcon width={27.8563} height={28} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    backgroundColor: '#191919',
    borderColor: '#2D2D2D',
    borderWidth: 1,
    borderRadius: 9.5,
    marginBottom: 12
  },
  touchArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 9.5
  },
  thumbnail: {
    width: 142.5,
    height: 79.3,
    borderRadius: 5.4,
    backgroundColor: '#1F1F1F'
  },
  body: {
    flex: 1,
    minHeight: 79.3,
    paddingLeft: 9.5,
    paddingRight: 28,
    justifyContent: 'space-between'
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Manrope_600SemiBold',
    lineHeight: 20.3
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  meta: {
    color: '#7C7C7C',
    fontSize: 12,
    lineHeight: 20.3,
    fontFamily: 'SpaceMono_400Regular'
  },
  menuButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuButtonAnchor: {
    position: 'absolute',
    right: 3,
    bottom: 7
  }
});
