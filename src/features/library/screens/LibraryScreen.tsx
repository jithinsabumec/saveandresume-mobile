import { useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { stateRepository } from '../../../data/stateRepository';
import {
  DEFAULT_CATEGORY,
  flattenCategories,
  listCategoriesForDisplay
} from '../../../data/stateTransforms';
import { trackEvent } from '../../../services/telemetry';
import { fetchYouTubeMetadata } from '../../../services/youtubeMetadata';
import { shareIntentService } from '../../../services/shareIntent';
import type { FlattenedVideo, ShareParseSuccess } from '../../../types/domain';
import { buildYouTubeWatchUrl, parseSharedTextForYouTubeTimestamp } from '../../../utils/youtubeParser';
import { AddCategoryModal } from '../../categories/components/AddCategoryModal';
import { MoveToCategoryModal } from '../../categories/components/MoveToCategoryModal';
import { CategoryFilterBar } from '../components/CategoryFilterBar';
import { TimestampCard } from '../components/TimestampCard';
import { useLibraryState } from '../hooks/useLibraryState';
import { ShareConfirmationModal } from '../../share/components/ShareConfirmationModal';

interface PendingShare {
  parsed: ShareParseSuccess;
  title: string;
  thumbnailUrl: string;
  loadingMetadata: boolean;
}

interface Props {
  userId: string;
  onSignOut: () => Promise<void>;
  signingOut: boolean;
}

const ALL_FILTER = 'All';

export function LibraryScreen({ userId, onSignOut, signingOut }: Props) {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useLibraryState(userId);

  const [selectedCategory, setSelectedCategory] = useState(ALL_FILTER);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [moveVideo, setMoveVideo] = useState<FlattenedVideo | null>(null);
  const [pendingShare, setPendingShare] = useState<PendingShare | null>(null);
  const [savingShare, setSavingShare] = useState(false);
  const [mutating, setMutating] = useState(false);

  const categories = data?.categories ?? { [DEFAULT_CATEGORY]: [] };

  const categoryNames = useMemo(() => listCategoriesForDisplay(categories), [categories]);
  const filterCategories = useMemo(() => [ALL_FILTER, ...categoryNames], [categoryNames]);

  const videos = useMemo(() => {
    const selected = selectedCategory === ALL_FILTER ? 'all' : selectedCategory;
    return flattenCategories(categories, selected);
  }, [categories, selectedCategory]);

  const counts = useMemo(() => {
    const next: Record<string, number> = {
      [ALL_FILTER]: flattenCategories(categories, 'all').length
    };

    categoryNames.forEach((category) => {
      next[category] = categories[category]?.length ?? 0;
    });

    return next;
  }, [categories, categoryNames]);

  const refreshState = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['library-state', userId] });
  }, [queryClient, userId]);

  const consumeSharedText = useCallback(async (sharedText: string) => {
    trackEvent('share_received', { platform: Platform.OS });

    const parsed = parseSharedTextForYouTubeTimestamp(sharedText);
    if (!parsed.ok) {
      trackEvent('parse_failure', { code: parsed.code });
      Alert.alert('Cannot Save Timestamp', parsed.message);
      await shareIntentService.clearInitialSharedText();
      return;
    }

    trackEvent('parse_success', { seconds: parsed.rawSeconds });

    const fallbackThumbnail = `https://i.ytimg.com/vi/${encodeURIComponent(parsed.videoId)}/hqdefault.jpg`;
    setPendingShare({
      parsed,
      title: `YouTube video ${parsed.videoId}`,
      thumbnailUrl: fallbackThumbnail,
      loadingMetadata: true
    });

    trackEvent('confirm_shown');

    const metadata = await fetchYouTubeMetadata(parsed.videoId);
    setPendingShare((current) => {
      if (!current || current.parsed.videoId !== parsed.videoId || current.parsed.rawSeconds !== parsed.rawSeconds) {
        return current;
      }

      return {
        ...current,
        title: metadata.title,
        thumbnailUrl: metadata.thumbnailUrl,
        loadingMetadata: false
      };
    });
  }, []);

  useEffect(() => {
    if (!shareIntentService.isSupported()) {
      return;
    }

    let active = true;

    shareIntentService.getInitialSharedText().then((text) => {
      if (active && text) {
        void consumeSharedText(text);
      }
    });

    const unsubscribe = shareIntentService.subscribe((text) => {
      if (active) {
        void consumeSharedText(text);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [consumeSharedText]);

  const handleConfirmShare = useCallback(async () => {
    if (!pendingShare) return;

    setSavingShare(true);

    try {
      await stateRepository.upsertTimestamp(
        userId,
        {
          videoId: pendingShare.parsed.videoId,
          title: pendingShare.title,
          currentTime: pendingShare.parsed.rawSeconds,
          thumbnail: pendingShare.thumbnailUrl,
          timestamp: Date.now()
        },
        DEFAULT_CATEGORY
      );
      await refreshState();
      await shareIntentService.clearInitialSharedText();
      setPendingShare(null);
      trackEvent('save_success', { source: 'share_intent' });
    } catch (saveError) {
      trackEvent('save_failure', {
        source: 'share_intent',
        error: saveError instanceof Error ? saveError.message : 'unknown'
      });
      Alert.alert('Save Failed', 'Unable to save this timestamp. Please try again.');
    } finally {
      setSavingShare(false);
    }
  }, [pendingShare, refreshState, userId]);

  const handleCancelShare = useCallback(async () => {
    setPendingShare(null);
    await shareIntentService.clearInitialSharedText();
  }, []);

  const handleOpenVideo = useCallback((video: FlattenedVideo) => {
    trackEvent('open_video', { videoId: video.videoId, source: 'library' });
    const url = buildYouTubeWatchUrl(video.videoId, video.currentTime);
    void Linking.openURL(url);
  }, []);

  const handleDeleteTimestamp = useCallback((video: FlattenedVideo) => {
    Alert.alert('Delete Timestamp', 'Remove this timestamp from your library?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setMutating(true);
          try {
            await stateRepository.deleteTimestamp(userId, video.videoId);
            await refreshState();
            trackEvent('category_actions', { action: 'delete_timestamp', videoId: video.videoId });
          } finally {
            setMutating(false);
          }
        }
      }
    ]);
  }, [refreshState, userId]);

  const handleMoveTimestamp = useCallback(async (targetCategory: string) => {
    if (!moveVideo) return;

    setMutating(true);
    try {
      await stateRepository.moveTimestamp(userId, moveVideo.videoId, targetCategory);
      await refreshState();
      setMoveVideo(null);
      trackEvent('category_actions', {
        action: 'move_timestamp',
        videoId: moveVideo.videoId,
        category: targetCategory
      });
    } finally {
      setMutating(false);
    }
  }, [moveVideo, refreshState, userId]);

  const handleAddCategory = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.toLowerCase() === 'all') {
      setAddCategoryOpen(false);
      return;
    }

    if (categories[trimmed]) {
      Alert.alert('Category Exists', `Category "${trimmed}" already exists.`);
      return;
    }

    setMutating(true);
    try {
      await stateRepository.createCategory(userId, trimmed);
      await refreshState();
      setAddCategoryOpen(false);
      trackEvent('category_actions', { action: 'create_category', category: trimmed });
    } finally {
      setMutating(false);
    }
  }, [categories, refreshState, userId]);

  const handleDeleteCategory = useCallback((category: string) => {
    if (category === DEFAULT_CATEGORY) {
      Alert.alert('Not Allowed', 'Default category cannot be deleted.');
      return;
    }

    Alert.alert('Delete Category', `Delete category "${category}" and all timestamps inside it?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setMutating(true);
          try {
            await stateRepository.deleteCategory(userId, category);
            if (selectedCategory === category) {
              setSelectedCategory(ALL_FILTER);
            }
            await refreshState();
            trackEvent('category_actions', { action: 'delete_category', category });
          } finally {
            setMutating(false);
          }
        }
      }
    ]);
  }, [refreshState, selectedCategory, userId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Timestamp Saver</Text>
          <Text style={styles.subtitle}>All your saved moments, synced.</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.headerButton} onPress={() => setAddCategoryOpen(true)}>
            <Text style={styles.headerButtonText}>+ Category</Text>
          </Pressable>
          <Pressable style={styles.signOutButton} onPress={() => void onSignOut()} disabled={signingOut}>
            <Text style={styles.signOutText}>{signingOut ? '...' : 'Sign Out'}</Text>
          </Pressable>
        </View>
      </View>

      <CategoryFilterBar
        categories={filterCategories}
        selected={selectedCategory}
        counts={counts}
        onSelect={setSelectedCategory}
      />

      <View style={styles.manageRow}>
        {categoryNames.filter((category) => category !== DEFAULT_CATEGORY).map((category) => (
          <Pressable key={category} style={styles.manageChip} onPress={() => handleDeleteCategory(category)}>
            <Text style={styles.manageChipText}>Delete {category}</Text>
          </Pressable>
        ))}
      </View>

      {error ? <Text style={styles.errorText}>Failed to load timestamps. Pull to retry.</Text> : null}

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={videos}
        keyExtractor={(item) => item.videoId}
        refreshing={isLoading || mutating}
        onRefresh={() => void refreshState()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No timestamps here yet. Share a YouTube URL from the YouTube app.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TimestampCard
            item={item}
            onOpen={handleOpenVideo}
            onMove={(video) => setMoveVideo(video)}
            onDelete={handleDeleteTimestamp}
          />
        )}
      />

      <AddCategoryModal
        visible={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
        onSubmit={(name) => void handleAddCategory(name)}
      />

      <MoveToCategoryModal
        visible={Boolean(moveVideo)}
        categories={categoryNames}
        currentCategory={moveVideo?.category ?? DEFAULT_CATEGORY}
        onClose={() => setMoveVideo(null)}
        onMove={(target) => void handleMoveTimestamp(target)}
      />

      <ShareConfirmationModal
        visible={Boolean(pendingShare)}
        title={pendingShare?.title ?? ''}
        thumbnailUrl={pendingShare?.thumbnailUrl ?? ''}
        formattedTime={pendingShare?.parsed.formattedTime ?? ''}
        loadingMetadata={pendingShare?.loadingMetadata ?? false}
        saving={savingShare}
        onCancel={() => void handleCancelShare()}
        onConfirm={() => void handleConfirmShare()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0B0F'
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 10
  },
  title: {
    color: '#FAFAFA',
    fontSize: 24,
    fontWeight: '700'
  },
  subtitle: {
    color: '#A1A1AA',
    fontSize: 14,
    marginTop: 4
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8
  },
  headerButton: {
    backgroundColor: '#E4FF5D',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  headerButtonText: {
    color: '#121212',
    fontWeight: '700'
  },
  signOutButton: {
    backgroundColor: '#1A1C23',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  signOutText: {
    color: '#E4E4E7',
    fontWeight: '600'
  },
  manageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  manageChip: {
    backgroundColor: '#2D1416',
    borderColor: '#4A1D21',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  manageChipText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '600'
  },
  errorText: {
    color: '#F87171',
    paddingHorizontal: 16,
    marginBottom: 8
  },
  list: {
    flex: 1
  },
  listContent: {
    padding: 16,
    paddingBottom: 120
  },
  emptyContainer: {
    paddingVertical: 80,
    paddingHorizontal: 20
  },
  emptyText: {
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22
  }
});
