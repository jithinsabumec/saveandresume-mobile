import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { FlattenedVideo } from '../../../types/domain';
import { formatTime } from '../../../utils/formatTime';

interface Props {
  item: FlattenedVideo;
  onOpen: (video: FlattenedVideo) => void;
  onMove: (video: FlattenedVideo) => void;
  onDelete: (video: FlattenedVideo) => void;
}

export function TimestampCard({ item, onOpen, onMove, onDelete }: Props) {
  return (
    <Pressable style={styles.card} onPress={() => onOpen(item)}>
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{item.title || 'Untitled video'}</Text>
        <Text style={styles.meta}>Timestamp {formatTime(item.currentTime)} • {item.category}</Text>
        <View style={styles.actions}>
          <Pressable style={styles.secondaryBtn} onPress={() => onMove(item)}>
            <Text style={styles.secondaryText}>Move</Text>
          </Pressable>
          <Pressable style={styles.dangerBtn} onPress={() => onDelete(item)}>
            <Text style={styles.dangerText}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111216',
    borderColor: '#24262E',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12
  },
  thumbnail: {
    width: '100%',
    height: 180,
    backgroundColor: '#1F1F1F'
  },
  body: {
    padding: 12,
    gap: 8
  },
  title: {
    color: '#F5F5F5',
    fontSize: 15,
    fontWeight: '600'
  },
  meta: {
    color: '#A1A1AA',
    fontSize: 13
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4
  },
  secondaryBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14
  },
  secondaryText: {
    color: '#E2E8F0',
    fontWeight: '600'
  },
  dangerBtn: {
    backgroundColor: '#3F1A1C',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14
  },
  dangerText: {
    color: '#FCA5A5',
    fontWeight: '600'
  }
});
