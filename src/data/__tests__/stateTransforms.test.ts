import { describe, expect, it } from 'vitest';

import {
  DEFAULT_CATEGORY,
  createCategory,
  deleteCategory,
  deleteTimestamp,
  flattenCategories,
  moveTimestamp,
  normalizeCategories,
  upsertTimestamp
} from '../stateTransforms';

describe('stateTransforms', () => {
  it('normalizes and ensures default category', () => {
    const normalized = normalizeCategories({});
    expect(normalized[DEFAULT_CATEGORY]).toEqual([]);
  });

  it('upsert keeps one timestamp per video globally in app operations', () => {
    const initial = {
      Default: [
        {
          videoId: 'abc',
          title: 'Video A',
          currentTime: 100,
          thumbnail: 'https://i.ytimg.com/vi/abc/hqdefault.jpg',
          timestamp: 1
        }
      ],
      Learn: []
    };

    const result = upsertTimestamp(
      initial,
      {
        videoId: 'abc',
        title: 'Video A',
        currentTime: 222,
        thumbnail: 'https://i.ytimg.com/vi/abc/hqdefault.jpg',
        timestamp: 2
      },
      'Learn'
    );

    expect(result.Default).toHaveLength(0);
    expect(result.Learn).toHaveLength(1);
    expect(result.Learn[0].currentTime).toBe(222);
  });

  it('deletes timestamp by video id', () => {
    const result = deleteTimestamp(
      {
        Default: [
          {
            videoId: 'abc',
            title: 'Video A',
            currentTime: 100,
            thumbnail: '',
            timestamp: 1
          }
        ]
      },
      'abc'
    );

    expect(result.Default).toHaveLength(0);
  });

  it('supports category CRUD constraints', () => {
    const created = createCategory({ Default: [] }, 'Work');
    expect(created.Work).toEqual([]);

    const deletedDefault = deleteCategory(created, 'Default');
    expect(deletedDefault.Default).toEqual([]);

    const deletedWork = deleteCategory(created, 'Work');
    expect(deletedWork.Work).toBeUndefined();
  });

  it('moves timestamp between categories', () => {
    const moved = moveTimestamp(
      {
        Default: [
          {
            videoId: 'abc',
            title: 'Video A',
            currentTime: 100,
            thumbnail: '',
            timestamp: 1
          }
        ],
        Learn: []
      },
      'abc',
      'Learn'
    );

    expect(moved.Default).toHaveLength(0);
    expect(moved.Learn).toHaveLength(1);
  });

  it('flattens all categories with dedupe by latest timestamp', () => {
    const flattened = flattenCategories(
      {
        Default: [
          {
            videoId: 'abc',
            title: 'Old',
            currentTime: 10,
            thumbnail: '',
            timestamp: 1
          }
        ],
        Learn: [
          {
            videoId: 'abc',
            title: 'New',
            currentTime: 20,
            thumbnail: '',
            timestamp: 2
          }
        ]
      },
      'all'
    );

    expect(flattened).toHaveLength(1);
    expect(flattened[0].category).toBe('Learn');
    expect(flattened[0].currentTime).toBe(20);
  });
});
