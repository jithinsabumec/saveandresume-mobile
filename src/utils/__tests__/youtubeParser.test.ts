import { describe, expect, it } from 'vitest';

import { parseSharedTextForYouTubeTimestamp } from '../youtubeParser';

describe('parseSharedTextForYouTubeTimestamp', () => {
  it('parses youtu.be links with seconds', () => {
    const result = parseSharedTextForYouTubeTimestamp('https://youtu.be/abc123?t=342');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.videoId).toBe('abc123');
      expect(result.rawSeconds).toBe(342);
      expect(result.formattedTime).toBe('5:42');
    }
  });

  it('parses watch links with t=5m42s', () => {
    const result = parseSharedTextForYouTubeTimestamp('https://www.youtube.com/watch?v=abc123&t=5m42s');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.videoId).toBe('abc123');
      expect(result.rawSeconds).toBe(342);
    }
  });

  it('parses embedded url from shared text', () => {
    const result = parseSharedTextForYouTubeTimestamp(
      'Watch this now https://www.youtube.com/watch?v=abc123&t=1h2m3s thanks'
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.rawSeconds).toBe(3723);
    }
  });

  it('fails for missing timestamp', () => {
    const result = parseSharedTextForYouTubeTimestamp('https://www.youtube.com/watch?v=abc123');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('MISSING_TIMESTAMP');
      expect(result.videoId).toBe('abc123');
    }
  });

  it('fails for shorts links', () => {
    const result = parseSharedTextForYouTubeTimestamp('https://www.youtube.com/shorts/abc123?t=22');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('UNSUPPORTED_SHORTS');
    }
  });
});
