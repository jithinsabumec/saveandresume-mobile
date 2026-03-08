import { DEFAULT_CATEGORY } from '../../../data/stateTransforms';

interface DeriveLibraryHomeViewStateInput {
  isLoading: boolean;
  hasError: boolean;
  totalVideoCount: number;
  categoryNames: string[];
}

interface LibraryHomeViewState {
  hasAnyVideos: boolean;
  hasUserGeneratedCategories: boolean;
  showCategoriesSection: boolean;
  showVideoLoading: boolean;
  showFullEmptyState: boolean;
  showEmptyWithCategories: boolean;
  showVideoList: boolean;
}

export function deriveLibraryHomeViewState({
  isLoading,
  hasError,
  totalVideoCount,
  categoryNames
}: DeriveLibraryHomeViewStateInput): LibraryHomeViewState {
  const hasAnyVideos = totalVideoCount > 0;
  const hasUserGeneratedCategories = categoryNames.some((category) => category !== DEFAULT_CATEGORY);

  // Default to empty state while initial data is unknown.
  // Show a loading hint inside that empty state until we know whether videos/categories exist.
  const showCategoriesSection = hasError || hasAnyVideos || hasUserGeneratedCategories;
  const showVideoLoading = isLoading && !hasError && !hasAnyVideos && !hasUserGeneratedCategories;
  const showFullEmptyState = !hasError && !hasAnyVideos && !hasUserGeneratedCategories;
  const showEmptyWithCategories = !hasError && !hasAnyVideos && hasUserGeneratedCategories;
  const showVideoList = !showVideoLoading && !showFullEmptyState && !showEmptyWithCategories;

  return {
    hasAnyVideos,
    hasUserGeneratedCategories,
    showCategoriesSection,
    showVideoLoading,
    showFullEmptyState,
    showEmptyWithCategories,
    showVideoList
  };
}
