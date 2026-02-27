export type CategoryMap = Record<string, VideoEntry[]>;

export interface VideoEntry {
  videoId: string;
  title: string;
  currentTime: number;
  thumbnail: string;
  timestamp: number;
}

export interface FlattenedVideo extends VideoEntry {
  category: string;
}

export interface StateDocument {
  schemaVersion: number;
  categoriesJson: string;
  migrationComplete: boolean;
  updatedAt: number;
  migratedAt?: number;
}

export interface AppState {
  categories: CategoryMap;
  migrationComplete: boolean;
  schemaVersion: number;
  updatedAt: number;
  migratedAt?: number;
}

export type ShareParseErrorCode =
  | 'NO_URL'
  | 'INVALID_URL'
  | 'NOT_YOUTUBE'
  | 'UNSUPPORTED_SHORTS'
  | 'MISSING_TIMESTAMP'
  | 'INVALID_TIMESTAMP';

export interface ShareParseFailure {
  ok: false;
  code: ShareParseErrorCode;
  message: string;
  sourceUrl?: string;
  videoId?: string;
}

export interface ShareParseSuccess {
  ok: true;
  videoId: string;
  rawSeconds: number;
  formattedTime: string;
  sourceUrl: string;
  canonicalWatchUrl: string;
}

export type ShareParseResult = ShareParseFailure | ShareParseSuccess;
