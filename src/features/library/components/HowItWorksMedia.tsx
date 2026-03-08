import { ResizeMode, Video, type AVPlaybackSource } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, type ImageSourcePropType, View } from 'react-native';

interface Props {
  source: AVPlaybackSource | null;
  posterSource: ImageSourcePropType;
  aspectRatio: number;
  shouldPlay: boolean;
  hasVideoError: boolean;
  onVideoError: () => void;
}

function extractSourceUri(source: AVPlaybackSource | null): string | null {
  if (!source || typeof source === 'number') {
    return null;
  }

  if ('uri' in source && typeof source.uri === 'string') {
    return source.uri;
  }

  return null;
}

function makeCacheKey(value: string): string {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return Math.abs(hash >>> 0).toString(36);
}

export function HowItWorksMedia({ source, posterSource, aspectRatio, shouldPlay, hasVideoError, onVideoError }: Props) {
  const [cachedVideoUri, setCachedVideoUri] = useState<string | null>(null);
  const sourceUri = useMemo(() => extractSourceUri(source), [source]);

  useEffect(() => {
    let cancelled = false;

    async function warmVideoCache() {
      setCachedVideoUri(null);

      if (!sourceUri || !(sourceUri.startsWith('http://') || sourceUri.startsWith('https://'))) {
        return;
      }

      if (!FileSystem.cacheDirectory) {
        return;
      }

      const cachePath = `${FileSystem.cacheDirectory}how-it-works-${makeCacheKey(sourceUri)}.mp4`;

      try {
        const cachedInfo = await FileSystem.getInfoAsync(cachePath);
        if (cancelled) {
          return;
        }

        if (cachedInfo.exists) {
          setCachedVideoUri(cachePath);
          return;
        }

        const downloadResult = await FileSystem.downloadAsync(sourceUri, cachePath);
        if (cancelled) {
          return;
        }

        if (downloadResult.status === 200) {
          setCachedVideoUri(cachePath);
        }
      } catch {
        // Stream fallback remains active; cache failures should not block playback.
      }
    }

    void warmVideoCache();

    return () => {
      cancelled = true;
    };
  }, [sourceUri]);

  const playbackSource: AVPlaybackSource | null = cachedVideoUri ? { uri: cachedVideoUri } : source;
  const showVideo = Boolean(playbackSource) && !hasVideoError;

  return (
    <View style={[styles.frame, { aspectRatio }]}>
      {showVideo ? (
        <Video
          style={styles.video}
          source={playbackSource ?? undefined}
          useNativeControls={false}
          shouldPlay={shouldPlay}
          isLooping
          resizeMode={ResizeMode.COVER}
          onError={onVideoError}
        />
      ) : (
        <View style={styles.posterWrap}>
          <Image source={posterSource} style={styles.poster} resizeMode="cover" />
          <View style={styles.placeholderOverlay}>
            <Text style={styles.placeholderTitle}>How it works preview</Text>
            <Text style={styles.placeholderText}>
              {hasVideoError
                ? "Couldn't load video. Check internet and try again."
                : 'Set EXPO_PUBLIC_HOW_IT_WORKS_VIDEO_URL to stream your video.'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#0A0A0A'
  },
  video: {
    width: '100%',
    height: '100%'
  },
  posterWrap: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  poster: {
    width: '100%',
    height: '100%'
  },
  placeholderOverlay: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8
  },
  placeholderTitle: {
    color: '#F2F2F2',
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'FunnelDisplay_600SemiBold',
    textAlign: 'center'
  },
  placeholderText: {
    color: '#A0A0A0',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Manrope_500Medium',
    textAlign: 'center'
  }
});
