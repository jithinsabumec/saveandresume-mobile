import { describe, expect, it } from 'vitest';

import { deriveLibraryHomeViewState } from '../libraryHomeViewState';

describe('deriveLibraryHomeViewState', () => {
  it('shows full empty state while loading with no known videos or user categories', () => {
    const result = deriveLibraryHomeViewState({
      isLoading: true,
      hasError: false,
      totalVideoCount: 0,
      categoryNames: ['Default']
    });

    expect(result.showCategoriesSection).toBe(false);
    expect(result.showVideoLoading).toBe(true);
    expect(result.showFullEmptyState).toBe(true);
    expect(result.showEmptyWithCategories).toBe(false);
    expect(result.showVideoList).toBe(false);
  });

  it('shows full empty state for first-time users with no videos and no user categories', () => {
    const result = deriveLibraryHomeViewState({
      isLoading: false,
      hasError: false,
      totalVideoCount: 0,
      categoryNames: ['Default']
    });

    expect(result.showCategoriesSection).toBe(false);
    expect(result.showVideoLoading).toBe(false);
    expect(result.showFullEmptyState).toBe(true);
    expect(result.showEmptyWithCategories).toBe(false);
    expect(result.showVideoList).toBe(false);
  });

  it('shows video list when videos exist', () => {
    const result = deriveLibraryHomeViewState({
      isLoading: false,
      hasError: false,
      totalVideoCount: 3,
      categoryNames: ['Default', 'Work']
    });

    expect(result.showCategoriesSection).toBe(true);
    expect(result.showVideoLoading).toBe(false);
    expect(result.showFullEmptyState).toBe(false);
    expect(result.showEmptyWithCategories).toBe(false);
    expect(result.showVideoList).toBe(true);
  });

  it('shows categories plus empty state when user categories exist but no videos remain', () => {
    const result = deriveLibraryHomeViewState({
      isLoading: false,
      hasError: false,
      totalVideoCount: 0,
      categoryNames: ['Default', 'Personal']
    });

    expect(result.showCategoriesSection).toBe(true);
    expect(result.showVideoLoading).toBe(false);
    expect(result.showFullEmptyState).toBe(false);
    expect(result.showEmptyWithCategories).toBe(true);
    expect(result.showVideoList).toBe(false);
  });

  it('does not show home empty state when app has videos even if one category is empty', () => {
    const result = deriveLibraryHomeViewState({
      isLoading: false,
      hasError: false,
      totalVideoCount: 1,
      categoryNames: ['Default', 'Study']
    });

    expect(result.showFullEmptyState).toBe(false);
    expect(result.showEmptyWithCategories).toBe(false);
    expect(result.showVideoList).toBe(true);
  });

  it('keeps categories visible and hides empty states when there is an error', () => {
    const result = deriveLibraryHomeViewState({
      isLoading: false,
      hasError: true,
      totalVideoCount: 0,
      categoryNames: ['Default']
    });

    expect(result.showCategoriesSection).toBe(true);
    expect(result.showVideoLoading).toBe(false);
    expect(result.showFullEmptyState).toBe(false);
    expect(result.showEmptyWithCategories).toBe(false);
    expect(result.showVideoList).toBe(true);
  });
});
