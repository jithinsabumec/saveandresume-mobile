import React from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Asset } from 'expo-asset';
import { SvgUri } from 'react-native-svg';

import type { FlattenedVideo } from '../../../types/domain';
import { formatTime } from '../../../utils/formatTime';

interface Props {
  item: FlattenedVideo;
  onOpen: (video: FlattenedVideo) => void;
  onMove: (video: FlattenedVideo) => void;
  onDelete: (video: FlattenedVideo) => void;
}

const homeMenuIconUri = Asset.fromModule(
  require('../../../../assets/images/figma/home_card_menu_icon_figma.svg')
).uri;
const homeTimestampIconUri = Asset.fromModule(
  require('../../../../assets/images/figma/home_timestamp_icon_figma.svg')
).uri;

export function TimestampCard({ item, onOpen, onMove, onDelete }: Props) {
  const openActions = () => {
    Alert.alert('Timestamp actions', 'Choose an action for this item.', [
      { text: 'Move', onPress: () => onMove(item) },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(item) },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  return (
    <View style={styles.card}>
      <Pressable style={styles.touchArea} onPress={() => onOpen(item)}>
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>{item.title || 'Untitled video'}</Text>
          <View style={styles.metaRow}>
            <SvgUri uri={homeTimestampIconUri} width={10} height={10} />
            <Text style={styles.meta}>{formatTime(item.currentTime)}</Text>
          </View>
        </View>
      </Pressable>

      <Pressable style={styles.menuButton} onPress={openActions} hitSlop={10}>
        <SvgUri uri={homeMenuIconUri} width={27.8563} height={28} />
      </Pressable>
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
    fontFamily: 'Manrope_500Medium'
  },
  menuButton: {
    position: 'absolute',
    right: 3,
    bottom: 7,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
