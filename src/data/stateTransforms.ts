import type { CategoryMap, FlattenedVideo, VideoEntry } from '../types/domain';

export const DEFAULT_CATEGORY = 'Default';

export function normalizeVideo(video: unknown): VideoEntry | null {
  if (!video || typeof video !== 'object') {
    return null;
  }

  const value = video as Record<string, unknown>;
  const videoId = typeof value.videoId === 'string' ? value.videoId.trim() : '';
  if (!videoId) {
    return null;
  }

  const currentTime = Number(value.currentTime);
  const timestamp = Number(value.timestamp);

  return {
    videoId,
    title: typeof value.title === 'string' ? value.title : '',
    currentTime: Number.isFinite(currentTime) && currentTime >= 0 ? currentTime : 0,
    thumbnail: typeof value.thumbnail === 'string' ? value.thumbnail : '',
    timestamp: Number.isFinite(timestamp) ? timestamp : Date.now()
  };
}

function sortedVideos(videos: VideoEntry[]): VideoEntry[] {
  return [...videos].sort((a, b) => b.timestamp - a.timestamp);
}

export function normalizeCategories(input: unknown): CategoryMap {
  const categories: CategoryMap = {};

  if (input && typeof input === 'object') {
    Object.entries(input as Record<string, unknown>).forEach(([category, rawVideos]) => {
      if (!category || typeof category !== 'string') {
        return;
      }

      const list = Array.isArray(rawVideos) ? rawVideos : [];
      const deduped: VideoEntry[] = [];

      list.forEach((video) => {
        const normalized = normalizeVideo(video);
        if (!normalized) return;

        const existingIdx = deduped.findIndex((item) => item.videoId === normalized.videoId);
        if (existingIdx === -1) {
          deduped.push(normalized);
          return;
        }

        if (normalized.timestamp >= deduped[existingIdx].timestamp) {
          deduped[existingIdx] = normalized;
        }
      });

      categories[category] = sortedVideos(deduped);
    });
  }

  if (!categories[DEFAULT_CATEGORY]) {
    categories[DEFAULT_CATEGORY] = [];
  }

  return categories;
}

export function parseCategoriesJson(categoriesJson: unknown): CategoryMap {
  if (typeof categoriesJson !== 'string' || !categoriesJson.trim()) {
    return normalizeCategories({ [DEFAULT_CATEGORY]: [] });
  }

  try {
    const parsed = JSON.parse(categoriesJson);
    return normalizeCategories(parsed);
  } catch {
    return normalizeCategories({ [DEFAULT_CATEGORY]: [] });
  }
}

export function serializeCategories(categories: CategoryMap): string {
  return JSON.stringify(normalizeCategories(categories));
}

export function ensureCategory(categories: CategoryMap, category: string): CategoryMap {
  const normalized = normalizeCategories(categories);
  const safeCategory = category.trim() || DEFAULT_CATEGORY;

  if (!normalized[safeCategory]) {
    normalized[safeCategory] = [];
  }

  return normalized;
}

function removeVideoFromAllCategories(categories: CategoryMap, videoId: string): CategoryMap {
  const output: CategoryMap = {};

  Object.entries(categories).forEach(([category, videos]) => {
    output[category] = videos.filter((video) => video.videoId !== videoId);
  });

  if (!output[DEFAULT_CATEGORY]) {
    output[DEFAULT_CATEGORY] = [];
  }

  return output;
}

export function upsertTimestamp(categories: CategoryMap, video: VideoEntry, targetCategory: string): CategoryMap {
  const normalized = ensureCategory(categories, targetCategory);
  const normalizedVideo = normalizeVideo(video);
  if (!normalizedVideo) {
    return normalized;
  }

  const output = removeVideoFromAllCategories(normalized, normalizedVideo.videoId);
  const safeCategory = targetCategory.trim() || DEFAULT_CATEGORY;
  output[safeCategory] = sortedVideos([...(output[safeCategory] ?? []), normalizedVideo]);

  return output;
}

export function deleteTimestamp(categories: CategoryMap, videoId: string): CategoryMap {
  return normalizeCategories(removeVideoFromAllCategories(categories, videoId));
}

export function createCategory(categories: CategoryMap, category: string): CategoryMap {
  const normalized = normalizeCategories(categories);
  const safeCategory = category.trim();

  if (!safeCategory || normalized[safeCategory]) {
    return normalized;
  }

  normalized[safeCategory] = [];
  return normalizeCategories(normalized);
}

export function deleteCategory(categories: CategoryMap, category: string): CategoryMap {
  const normalized = normalizeCategories(categories);
  const safeCategory = category.trim();

  if (!safeCategory || safeCategory === DEFAULT_CATEGORY) {
    return normalized;
  }

  if (!normalized[safeCategory]) {
    return normalized;
  }

  const output: CategoryMap = {};
  Object.entries(normalized).forEach(([name, videos]) => {
    if (name !== safeCategory) {
      output[name] = videos;
    }
  });

  if (!output[DEFAULT_CATEGORY]) {
    output[DEFAULT_CATEGORY] = [];
  }

  return normalizeCategories(output);
}

export function moveTimestamp(
  categories: CategoryMap,
  videoId: string,
  targetCategory: string
): CategoryMap {
  const normalized = ensureCategory(categories, targetCategory);
  const safeTarget = targetCategory.trim() || DEFAULT_CATEGORY;

  let found: VideoEntry | null = null;
  Object.values(normalized).forEach((videos) => {
    videos.forEach((video) => {
      if (video.videoId === videoId && (!found || video.timestamp >= found.timestamp)) {
        found = video;
      }
    });
  });

  if (!found) {
    return normalized;
  }

  return upsertTimestamp(normalized, found, safeTarget);
}

export function flattenCategories(categories: CategoryMap, selectedCategory: string): FlattenedVideo[] {
  const normalized = normalizeCategories(categories);
  const filter = selectedCategory.trim().toLowerCase();

  if (filter !== 'all') {
    return sortedVideos(normalized[selectedCategory] ?? []).map((video) => ({
      ...video,
      category: selectedCategory
    }));
  }

  const latestByVideo = new Map<string, FlattenedVideo>();

  Object.entries(normalized).forEach(([category, videos]) => {
    videos.forEach((video) => {
      const existing = latestByVideo.get(video.videoId);
      if (!existing || video.timestamp >= existing.timestamp) {
        latestByVideo.set(video.videoId, { ...video, category });
      }
    });
  });

  return [...latestByVideo.values()].sort((a, b) => b.timestamp - a.timestamp);
}

export function listCategoriesForDisplay(categories: CategoryMap): string[] {
  const normalized = normalizeCategories(categories);

  return Object.keys(normalized).sort((a, b) => {
    if (a === DEFAULT_CATEGORY) return -1;
    if (b === DEFAULT_CATEGORY) return 1;
    return a.localeCompare(b);
  });
}
