import { useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { stateRepository } from '../../../data/stateRepository';
import { timestampsRepository } from '../../../data/timestampsRepository';
import { BrandMark } from '../../../components/BrandMark';
import {
  DEFAULT_CATEGORY,
  flattenCategories,
  listCategoriesForDisplay
} from '../../../data/stateTransforms';
import { trackEvent } from '../../../services/telemetry';
import { showGenericSaveErrorToast } from '../../../services/toast';
import { fetchYouTubeMetadata } from '../../../services/youtubeMetadata';
import { shareIntentService } from '../../../services/shareIntent';
import type { FlattenedVideo, ShareParseSuccess } from '../../../types/domain';
import { buildYouTubeWatchUrl, parseSharedTextForYouTubeTimestamp } from '../../../utils/youtubeParser';
import { AddCategoryModal } from '../../categories/components/AddCategoryModal';
import { MoveToCategoryModal } from '../../categories/components/MoveToCategoryModal';
import { CategoryFilterBar } from '../components/CategoryFilterBar';
import { EmptyState } from '../components/EmptyState';
import { TimestampCard } from '../components/TimestampCard';
import { useLibraryState } from '../hooks/useLibraryState';
import { ShareConfirmationModal } from '../../share/components/ShareConfirmationModal';
import { MissingTimestampDialog } from '../../share/components/MissingTimestampDialog';

interface PendingShare {
  parsed: ShareParseSuccess;
  title: string;
  thumbnailUrl: string;
  loadingMetadata: boolean;
  note: string;
}

interface MissingTimestampNotice {
  videoId: string;
  title: string;
  thumbnailUrl: string;
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
  const [missingTimestampNotice, setMissingTimestampNotice] = useState<MissingTimestampNotice | null>(null);
  const [savingShare, setSavingShare] = useState(false);
  const [processingShare, setProcessingShare] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [managingCategories, setManagingCategories] = useState(false);

  const categories = data?.categories ?? { [DEFAULT_CATEGORY]: [] };

  const categoryNames = useMemo(() => listCategoriesForDisplay(categories), [categories]);
  const filterCategories = useMemo(() => [ALL_FILTER, ...categoryNames], [categoryNames]);
  const deletableCategories = useMemo(
    () => categoryNames.filter((category) => category !== DEFAULT_CATEGORY),
    [categoryNames]
  );
  const userInitial = useMemo(() => userId.slice(0, 1).toUpperCase() || 'U', [userId]);
  const androidTopInset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 8 : 0;

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

  const openYouTubeFromAlert = useCallback(async (videoId: string) => {
    const deepLink = `youtube://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
    const fallback = `https://youtu.be/${encodeURIComponent(videoId)}`;

    try {
      const canOpenDeepLink = await Linking.canOpenURL(deepLink);
      if (canOpenDeepLink) {
        await Linking.openURL(deepLink);
        return;
      }
    } catch {
      // Fall through to browser fallback URL.
    }

    await Linking.openURL(fallback);
  }, []);

  const saveSharedTimestamp = useCallback(async (
    payload: {
      videoId: string;
      sourceUrl: string;
      rawSeconds: number;
      formattedTime: string;
      note: string | null;
    },
    libraryMetadata: { title: string; thumbnailUrl: string }
  ) => {
    await timestampsRepository.createTimestamp(userId, payload);
    await stateRepository.upsertTimestamp(
      userId,
      {
        videoId: payload.videoId,
        title: libraryMetadata.title,
        currentTime: payload.rawSeconds,
        thumbnail: libraryMetadata.thumbnailUrl,
        timestamp: Date.now()
      },
      DEFAULT_CATEGORY
    );
  }, [userId]);

  const consumeSharedText = useCallback(async (sharedText: string) => {
    trackEvent('share_received', { platform: Platform.OS });

    const parsed = parseSharedTextForYouTubeTimestamp(sharedText);
    if (!parsed.ok) {
      trackEvent('parse_failure', { code: parsed.code });
      if (parsed.code === 'MISSING_TIMESTAMP' && parsed.videoId) {
        const videoId = parsed.videoId;
        const sourceUrl = parsed.sourceUrl ?? sharedText;
        const fallbackThumbnail = `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
        setPendingShare(null);
        setProcessingShare(true);

        try {
          const metadata = await fetchYouTubeMetadata(videoId);

          await saveSharedTimestamp(
            {
              videoId,
              sourceUrl,
              rawSeconds: 0,
              formattedTime: '0:00',
              note: null
            },
            {
              title: metadata.title || `YouTube video ${videoId}`,
              thumbnailUrl: metadata.thumbnailUrl || fallbackThumbnail
            }
          );
          await refreshState();
          await shareIntentService.clearInitialSharedText();
          trackEvent('save_success', { source: 'share_intent_missing_timestamp' });
          setMissingTimestampNotice({
            videoId,
            title: metadata.title || `YouTube video ${videoId}`,
            thumbnailUrl: metadata.thumbnailUrl || fallbackThumbnail
          });
        } catch (saveError) {
          trackEvent('save_failure', {
            source: 'share_intent_missing_timestamp',
            error: saveError instanceof Error ? saveError.message : 'unknown'
          });
          showGenericSaveErrorToast();
          await shareIntentService.clearInitialSharedText();
        } finally {
          setProcessingShare(false);
        }
        return;
      }

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
      loadingMetadata: true,
      note: ''
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
  }, [refreshState, saveSharedTimestamp]);

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
      await saveSharedTimestamp(
        {
          videoId: pendingShare.parsed.videoId,
          sourceUrl: pendingShare.parsed.sourceUrl,
          rawSeconds: pendingShare.parsed.rawSeconds,
          formattedTime: pendingShare.parsed.formattedTime,
          note: pendingShare.note.trim() ? pendingShare.note.trim() : null
        },
        {
          title: pendingShare.title,
          thumbnailUrl: pendingShare.thumbnailUrl
        }
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
      showGenericSaveErrorToast();
    } finally {
      setSavingShare(false);
    }
  }, [pendingShare, refreshState, saveSharedTimestamp]);

  const handleCancelShare = useCallback(async () => {
    setPendingShare(null);
    await shareIntentService.clearInitialSharedText();
  }, []);

  const handleDismissMissingTimestamp = useCallback(() => {
    setMissingTimestampNotice(null);
  }, []);

  const handleGoToYouTubeFromDialog = useCallback(() => {
    if (!missingTimestampNotice) {
      return;
    }

    setMissingTimestampNotice(null);
    void openYouTubeFromAlert(missingTimestampNotice.videoId);
  }, [missingTimestampNotice, openYouTubeFromAlert]);

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
            setManagingCategories(false);
            trackEvent('category_actions', { action: 'delete_category', category });
          } finally {
            setMutating(false);
          }
        }
      }
    ]);
  }, [refreshState, selectedCategory, userId]);

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: androidTopInset }]}>
      <View style={styles.header}>
        <BrandMark size="small" />
        <View style={styles.headerActions}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userInitial}</Text>
          </View>
          <Pressable style={styles.headerIconButton} onPress={() => void onSignOut()} disabled={signingOut}>
            {signingOut ? (
              <ActivityIndicator size="small" color="#D2D2D2" />
            ) : (
              <Text style={styles.headerIconText}>-&gt;</Text>
            )}
          </Pressable>
        </View>
      </View>

      <View style={styles.categoriesSection}>
        <View style={styles.categoriesHeader}>
          <Text style={styles.categoriesTitle}>Categories</Text>
          <View style={styles.categoriesHeaderActions}>
            <Pressable
              style={styles.categoryActionButton}
              onPress={() => setManagingCategories((current) => !current)}
              disabled={deletableCategories.length === 0}
            >
              <Text
                style={[
                  styles.categoryActionText,
                  deletableCategories.length === 0 ? styles.categoryActionTextDisabled : null
                ]}
              >
                {managingCategories ? 'OK' : 'ED'}
              </Text>
            </Pressable>
            <Pressable style={styles.categoryActionButton} onPress={() => setAddCategoryOpen(true)}>
              <Text style={styles.categoryActionText}>+</Text>
            </Pressable>
          </View>
        </View>

        <CategoryFilterBar
          categories={filterCategories}
          selected={selectedCategory}
          counts={counts}
          onSelect={setSelectedCategory}
        />
      </View>

      {managingCategories && deletableCategories.length > 0 ? (
        <View style={styles.manageRow}>
          {deletableCategories.map((category) => (
            <Pressable key={category} style={styles.manageChip} onPress={() => handleDeleteCategory(category)}>
              <Text style={styles.manageChipText}>{category}</Text>
              <Text style={styles.manageChipIcon}>x</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {error ? <Text style={styles.errorText}>Failed to load timestamps. Pull to retry.</Text> : null}

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={videos}
        keyExtractor={(item) => item.videoId}
        refreshing={isLoading || mutating}
        onRefresh={() => void refreshState()}
        ListEmptyComponent={<EmptyState />}
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
        videoId={pendingShare?.parsed.videoId ?? ''}
        title={pendingShare?.title ?? ''}
        thumbnailUrl={pendingShare?.thumbnailUrl ?? ''}
        formattedTime={pendingShare?.parsed.formattedTime ?? ''}
        note={pendingShare?.note ?? ''}
        loadingMetadata={pendingShare?.loadingMetadata ?? false}
        saving={savingShare}
        onChangeNote={(value) => setPendingShare((current) => (current ? { ...current, note: value } : current))}
        onCancel={() => void handleCancelShare()}
        onConfirm={() => void handleConfirmShare()}
      />

      <MissingTimestampDialog
        visible={Boolean(missingTimestampNotice)}
        title={missingTimestampNotice?.title ?? ''}
        thumbnailUrl={missingTimestampNotice?.thumbnailUrl ?? ''}
        onDismiss={handleDismissMissingTimestamp}
        onGoToYoutube={handleGoToYouTubeFromDialog}
      />

      {processingShare ? (
        <View style={styles.processingOverlay}>
          <View style={styles.processingCard}>
            <ActivityIndicator color="#ED1A43" />
            <Text style={styles.processingText}>Saving shared video...</Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#101010'
  },
  header: {
    height: 40.3,
    marginTop: 12,
    marginHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8D7AEF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  headerIconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#585864',
    backgroundColor: '#474750',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerIconText: {
    color: '#D2D2D2',
    fontSize: 11,
    lineHeight: 12,
    fontWeight: '700'
  },
  categoriesSection: {
    marginTop: 36,
    gap: 9.5
  },
  categoriesHeader: {
    marginHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  categoriesTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22
  },
  categoriesHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  categoryActionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3C3C3C',
    backgroundColor: '#191919',
    alignItems: 'center',
    justifyContent: 'center'
  },
  categoryActionText: {
    color: '#D2D2D2',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700'
  },
  categoryActionTextDisabled: {
    color: '#555555'
  },
  manageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4
  },
  manageChip: {
    backgroundColor: '#34121A',
    borderColor: '#81273B',
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 10,
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  manageChipText: {
    color: '#F3B4C1',
    fontSize: 13,
    fontWeight: '600'
  },
  manageChipIcon: {
    color: '#F3B4C1',
    fontSize: 12,
    lineHeight: 12,
    fontWeight: '700'
  },
  errorText: {
    color: '#F3A3B6',
    paddingHorizontal: 24,
    marginBottom: 8
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 120
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000075',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  processingCard: {
    backgroundColor: '#1D1D1D',
    borderRadius: 12,
    borderColor: '#363636',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  processingText: {
    color: '#E8E8E8',
    fontSize: 14,
    fontWeight: '600'
  }
});
