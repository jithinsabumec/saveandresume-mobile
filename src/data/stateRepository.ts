import { collection, doc, getDoc, runTransaction, serverTimestamp, setDoc } from 'firebase/firestore';

import { db } from '../services/firebase';
import type { AppState, CategoryMap, VideoEntry } from '../types/domain';
import {
  DEFAULT_CATEGORY,
  createCategory as createCategoryTransform,
  deleteCategory as deleteCategoryTransform,
  deleteTimestamp as deleteTimestampTransform,
  normalizeCategories,
  parseCategoriesJson,
  serializeCategories,
  upsertTimestamp as upsertTimestampTransform,
  moveTimestamp as moveTimestampTransform
} from './stateTransforms';

const SCHEMA_VERSION = 2;

function stateDocumentRef(userId: string) {
  return doc(db, 'users', userId, 'data', 'state');
}

function emptyState(): AppState {
  return {
    categories: { [DEFAULT_CATEGORY]: [] },
    migrationComplete: false,
    schemaVersion: SCHEMA_VERSION,
    updatedAt: Date.now()
  };
}

function parseState(payload: Record<string, unknown> | undefined): AppState {
  if (!payload) {
    return emptyState();
  }

  const categories = parseCategoriesJson(payload.categoriesJson);
  const migrationComplete = payload.migrationComplete === true;
  const schemaVersion = Number(payload.schemaVersion ?? SCHEMA_VERSION);
  const updatedAt = Number(payload.updatedAt ?? Date.now());
  const migratedAt = payload.migratedAt !== undefined ? Number(payload.migratedAt) : undefined;

  return {
    categories,
    migrationComplete,
    schemaVersion: Number.isFinite(schemaVersion) ? schemaVersion : SCHEMA_VERSION,
    updatedAt: Number.isFinite(updatedAt) ? updatedAt : Date.now(),
    ...(Number.isFinite(migratedAt) ? { migratedAt } : {})
  };
}

function buildPersistedPayload(categories: CategoryMap, migrationComplete = true) {
  const now = Date.now();

  const payload: Record<string, unknown> = {
    schemaVersion: SCHEMA_VERSION,
    categoriesJson: serializeCategories(categories),
    migrationComplete,
    updatedAt: now
  };

  if (migrationComplete) {
    payload.migratedAt = now;
  }

  return payload;
}

export const stateRepository = {
  async getState(userId: string): Promise<AppState> {
    const snapshot = await getDoc(stateDocumentRef(userId));
    if (!snapshot.exists()) {
      return emptyState();
    }

    return parseState(snapshot.data() as Record<string, unknown>);
  },

  async saveState(userId: string, categories: CategoryMap, migrationComplete = true): Promise<AppState> {
    const normalized = normalizeCategories(categories);
    const payload = buildPersistedPayload(normalized, migrationComplete);
    await setDoc(stateDocumentRef(userId), payload, { merge: true });

    return parseState(payload);
  },

  async upsertTimestamp(userId: string, video: VideoEntry, targetCategory: string): Promise<AppState> {
    return runTransaction(db, async (transaction) => {
      const ref = stateDocumentRef(userId);
      const snapshot = await transaction.get(ref);
      const state = parseState(snapshot.exists() ? (snapshot.data() as Record<string, unknown>) : undefined);
      const categories = upsertTimestampTransform(state.categories, video, targetCategory);
      const payload = buildPersistedPayload(categories, true);
      transaction.set(ref, payload, { merge: true });
      return parseState(payload);
    });
  },

  async saveSharedTimestamp(
    userId: string,
    payload: {
      videoId: string;
      sourceUrl: string;
      rawSeconds: number;
      formattedTime: string;
      note: string | null;
    },
    libraryMetadata: { title: string; thumbnailUrl: string },
    targetCategory = DEFAULT_CATEGORY
  ): Promise<{ state: AppState; timestampId: string }> {
    return runTransaction(db, async (transaction) => {
      const ref = stateDocumentRef(userId);
      const snapshot = await transaction.get(ref);
      const state = parseState(snapshot.exists() ? (snapshot.data() as Record<string, unknown>) : undefined);

      const video: VideoEntry = {
        videoId: payload.videoId,
        title: libraryMetadata.title,
        currentTime: payload.rawSeconds,
        thumbnail: libraryMetadata.thumbnailUrl,
        timestamp: Date.now()
      };
      const categories = upsertTimestampTransform(state.categories, video, targetCategory);
      const statePayload = buildPersistedPayload(categories, true);

      const timestampRef = doc(collection(db, 'users', userId, 'timestamps'));
      transaction.set(timestampRef, {
        videoId: payload.videoId,
        sourceUrl: payload.sourceUrl,
        rawSeconds: payload.rawSeconds,
        formattedTime: payload.formattedTime,
        note: payload.note,
        createdAt: serverTimestamp()
      });
      transaction.set(ref, statePayload, { merge: true });

      return {
        state: parseState(statePayload),
        timestampId: timestampRef.id
      };
    });
  },

  async deleteTimestamp(userId: string, videoId: string): Promise<AppState> {
    return runTransaction(db, async (transaction) => {
      const ref = stateDocumentRef(userId);
      const snapshot = await transaction.get(ref);
      const state = parseState(snapshot.exists() ? (snapshot.data() as Record<string, unknown>) : undefined);
      const categories = deleteTimestampTransform(state.categories, videoId);
      const payload = buildPersistedPayload(categories, true);
      transaction.set(ref, payload, { merge: true });
      return parseState(payload);
    });
  },

  async createCategory(userId: string, category: string): Promise<AppState> {
    return runTransaction(db, async (transaction) => {
      const ref = stateDocumentRef(userId);
      const snapshot = await transaction.get(ref);
      const state = parseState(snapshot.exists() ? (snapshot.data() as Record<string, unknown>) : undefined);
      const categories = createCategoryTransform(state.categories, category);
      const payload = buildPersistedPayload(categories, true);
      transaction.set(ref, payload, { merge: true });
      return parseState(payload);
    });
  },

  async deleteCategory(userId: string, category: string): Promise<AppState> {
    return runTransaction(db, async (transaction) => {
      const ref = stateDocumentRef(userId);
      const snapshot = await transaction.get(ref);
      const state = parseState(snapshot.exists() ? (snapshot.data() as Record<string, unknown>) : undefined);
      const categories = deleteCategoryTransform(state.categories, category);
      const payload = buildPersistedPayload(categories, true);
      transaction.set(ref, payload, { merge: true });
      return parseState(payload);
    });
  },

  async moveTimestamp(userId: string, videoId: string, targetCategory: string): Promise<AppState> {
    return runTransaction(db, async (transaction) => {
      const ref = stateDocumentRef(userId);
      const snapshot = await transaction.get(ref);
      const state = parseState(snapshot.exists() ? (snapshot.data() as Record<string, unknown>) : undefined);
      const categories = moveTimestampTransform(state.categories, videoId, targetCategory);
      const payload = buildPersistedPayload(categories, true);
      transaction.set(ref, payload, { merge: true });
      return parseState(payload);
    });
  }
};
