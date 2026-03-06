import { describe, expect, it } from 'vitest';

import { buildYouTubeOpenCandidates } from '../youtubeOpen';

describe('buildYouTubeOpenCandidates', () => {
  it('builds Android candidates with app deep links first and web fallback last', () => {
    const candidates = buildYouTubeOpenCandidates('abc123', 42, 'android');

    expect(candidates[0]).toBe('vnd.youtube://abc123?t=42&time_continue=42');
    expect(candidates[candidates.length - 1]).toBe('https://youtu.be/abc123?t=42');
    expect(candidates.some((value) => value.startsWith('https://www.youtube.com/watch?v=abc123'))).toBe(true);
  });

  it('normalizes invalid seconds to zero', () => {
    const candidates = buildYouTubeOpenCandidates('abc123', Number.NaN, 'ios');

    expect(candidates.every((value) => value.includes('=0') || value.includes('t=0s'))).toBe(true);
  });

  it('url-encodes video id', () => {
    const candidates = buildYouTubeOpenCandidates('abc 123', 7, 'web');

    expect(candidates[0]).toContain('abc%20123');
    expect(candidates[1]).toContain('abc%20123');
  });
});
