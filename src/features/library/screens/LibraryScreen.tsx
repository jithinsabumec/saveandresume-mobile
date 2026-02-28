import { useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { HomeAddIcon, HomeEditIcon, HomeLogoIcon } from '../../../components/FigmaIcons';
import { stateRepository } from '../../../data/stateRepository';
import { timestampsRepository } from '../../../data/timestampsRepository';
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
import { AccountActionsMenu } from '../components/AccountActionsMenu';
import { CategoryFilterBar } from '../components/CategoryFilterBar';
import { EmptyState } from '../components/EmptyState';
import { TimestampActionsMenu } from '../components/TimestampActionsMenu';
import { TimestampCard, type MenuAnchorRect } from '../components/TimestampCard';
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
  userEmail: string | null;
  userDisplayName: string | null;
  userPhotoUrl: string | null;
  onSignOut: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  signingOut: boolean;
  deletingAccount: boolean;
}

const ALL_FILTER = 'All';

export function LibraryScreen({
  userId,
  userEmail,
  userDisplayName,
  userPhotoUrl,
  onSignOut,
  onDeleteAccount,
  signingOut,
  deletingAccount
}: Props) {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useLibraryState(userId);

  const [selectedCategory, setSelectedCategory] = useState(ALL_FILTER);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<MenuAnchorRect | null>(null);
  const [timestampMenu, setTimestampMenu] = useState<{ video: FlattenedVideo; anchor: MenuAnchorRect } | null>(null);
  const [pendingShare, setPendingShare] = useState<PendingShare | null>(null);
  const [missingTimestampNotice, setMissingTimestampNotice] = useState<MissingTimestampNotice | null>(null);
  const [savingShare, setSavingShare] = useState(false);
  const [processingShare, setProcessingShare] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [editingCategories, setEditingCategories] = useState(false);
  const [avatarImageError, setAvatarImageError] = useState(false);
  const avatarButtonRef = useRef<View>(null);

  const categories = data?.categories ?? { [DEFAULT_CATEGORY]: [] };

  const categoryNames = useMemo(() => listCategoriesForDisplay(categories), [categories]);
  const filterCategories = useMemo(() => [ALL_FILTER, ...categoryNames], [categoryNames]);
  const deletableCategories = useMemo(
    () => categoryNames.filter((category) => category !== DEFAULT_CATEGORY),
    [categoryNames]
  );
  const userInitial = useMemo(() => {
    const label = userDisplayName?.trim() || userEmail?.trim() || userId.trim() || 'U';
    return label.slice(0, 1).toUpperCase();
  }, [userDisplayName, userEmail, userId]);
  const androidTopInset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 8 : 0;

  useEffect(() => {
    setAvatarImageError(false);
  }, [userPhotoUrl]);

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

  const handleOpenTimestampMenu = useCallback((video: FlattenedVideo, anchor: MenuAnchorRect) => {
    setTimestampMenu({ video, anchor });
  }, []);

  const handleOpenAccountMenu = useCallback(() => {
    if (signingOut || deletingAccount) {
      return;
    }

    avatarButtonRef.current?.measureInWindow((x, y, width, height) => {
      setAccountMenuAnchor({ x, y, width, height });
    });
  }, [deletingAccount, signingOut]);

  const handleRequestSignOut = useCallback(() => {
    setAccountMenuAnchor(null);
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          void onSignOut().catch(() => undefined);
        }
      }
    ]);
  }, [onSignOut]);

  const handleRequestDeleteAccount = useCallback(() => {
    setAccountMenuAnchor(null);
    Alert.alert(
      'Delete Account',
      'Delete your account and permanently remove your saved timestamps and categories? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete account',
          style: 'destructive',
          onPress: () => {
            void onDeleteAccount().catch(() => undefined);
          }
        }
      ]
    );
  }, [onDeleteAccount]);

  const handleMoveTimestamp = useCallback(async (targetCategory: string) => {
    if (!timestampMenu) {
      return;
    }

    if (timestampMenu.video.category === targetCategory) {
      setTimestampMenu(null);
      return;
    }

    const video = timestampMenu.video;
    setTimestampMenu(null);
    setMutating(true);
    try {
      await stateRepository.moveTimestamp(userId, video.videoId, targetCategory);
      await refreshState();
      trackEvent('category_actions', {
        action: 'move_timestamp',
        videoId: video.videoId,
        category: targetCategory
      });
    } finally {
      setMutating(false);
    }
  }, [refreshState, timestampMenu, userId]);

  const handleAddCategory = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Category Name Required', 'Please enter a category name.');
      return;
    }

    if (trimmed.toLowerCase() === 'all') {
      Alert.alert('Name Not Allowed', 'The name "All" is reserved for the combined view.');
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
            if (deletableCategories.length <= 1) {
              setEditingCategories(false);
            }
            trackEvent('category_actions', { action: 'delete_category', category });
          } finally {
            setMutating(false);
          }
        }
      }
    ]);
  }, [deletableCategories.length, refreshState, selectedCategory, userId]);

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: androidTopInset }]}>
      <View style={styles.header}>
        <HomeLogoIcon width={90.023} height={40.29} />
        <View style={styles.headerActions}>
          <View collapsable={false} ref={avatarButtonRef}>
            <Pressable
              style={({ pressed }) => [
                styles.avatarButton,
                pressed ? styles.avatarButtonPressed : null,
                signingOut || deletingAccount ? styles.avatarButtonDisabled : null
              ]}
              onPress={handleOpenAccountMenu}
              disabled={signingOut || deletingAccount}
            >
              <View style={styles.avatar}>
                {userPhotoUrl && !avatarImageError ? (
                  <Image
                    source={{ uri: userPhotoUrl }}
                    style={styles.avatarImage}
                    onError={() => setAvatarImageError(true)}
                  />
                ) : (
                  <Text style={styles.avatarText}>{userInitial}</Text>
                )}
              </View>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.categoriesSection}>
        <View style={styles.categoriesHeader}>
          <Text style={styles.categoriesTitle}>Categories</Text>
          <View style={styles.categoriesHeaderActions}>
            {editingCategories ? (
              <Pressable style={styles.saveCategoriesButton} onPress={() => setEditingCategories(false)}>
                <Text style={styles.saveCategoriesButtonText}>Save</Text>
              </Pressable>
            ) : (
              <>
                <Pressable
                  style={[
                    styles.categoryActionButton,
                    deletableCategories.length === 0 ? styles.categoryActionButtonDisabled : null
                  ]}
                  onPress={() => setEditingCategories(true)}
                  disabled={deletableCategories.length === 0}
                >
                  <HomeEditIcon width={14} height={14} />
                </Pressable>
                <Pressable style={styles.categoryActionButton} onPress={() => setAddCategoryOpen(true)}>
                  <HomeAddIcon width={14} height={14} />
                </Pressable>
              </>
            )}
          </View>
        </View>

        <CategoryFilterBar
          categories={filterCategories}
          selected={selectedCategory}
          counts={counts}
          onSelect={setSelectedCategory}
          editMode={editingCategories}
          lockedCategories={[ALL_FILTER, DEFAULT_CATEGORY]}
          onDeleteCategory={handleDeleteCategory}
        />
      </View>

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
            onOpenMenu={handleOpenTimestampMenu}
          />
        )}
      />

      <AddCategoryModal
        visible={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
        onSubmit={(name) => void handleAddCategory(name)}
      />

      <TimestampActionsMenu
        visible={Boolean(timestampMenu)}
        anchor={timestampMenu?.anchor ?? null}
        video={timestampMenu?.video ?? null}
        categories={categoryNames}
        onClose={() => setTimestampMenu(null)}
        onMove={(target) => void handleMoveTimestamp(target)}
        onDelete={() => {
          if (!timestampMenu) {
            return;
          }

          const video = timestampMenu.video;
          setTimestampMenu(null);
          handleDeleteTimestamp(video);
        }}
      />

      <AccountActionsMenu
        visible={Boolean(accountMenuAnchor)}
        anchor={accountMenuAnchor}
        onClose={() => setAccountMenuAnchor(null)}
        onSignOut={handleRequestSignOut}
        onDeleteAccount={handleRequestDeleteAccount}
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

      {processingShare || signingOut || deletingAccount ? (
        <View style={styles.processingOverlay}>
          <View style={styles.processingCard}>
            <ActivityIndicator color="#ED1A43" />
            <Text style={styles.processingText}>
              {deletingAccount ? 'Deleting account...' : signingOut ? 'Logging out...' : 'Saving shared video...'}
            </Text>
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
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  avatarButton: {
    borderRadius: 22,
    padding: 2
  },
  avatarButtonPressed: {
    backgroundColor: '#1B1B1B'
  },
  avatarButtonDisabled: {
    opacity: 0.7
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8D7AEF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Manrope_600SemiBold'
  },
  categoriesSection: {
    marginTop: 36,
    gap: 9.5
  },
  categoriesHeader: {
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  categoriesTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Manrope_600SemiBold',
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
  categoryActionButtonDisabled: {
    opacity: 0.45
  },
  saveCategoriesButton: {
    minHeight: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C61743',
    backgroundColor: '#83112E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10
  },
  saveCategoriesButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Manrope_500Medium'
  },
  errorText: {
    color: '#F3A3B6',
    paddingHorizontal: 16,
    marginBottom: 8
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingHorizontal: 16,
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
    fontWeight: '600',
    fontFamily: 'Manrope_600SemiBold'
  }
});
