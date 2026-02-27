import { formatTime } from './formatTime';
import type { ShareParseFailure, ShareParseResult, ShareParseSuccess } from '../types/domain';

const SUPPORTED_YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'www.youtu.be'
]);

function failure(
  code: ShareParseFailure['code'],
  message: string,
  sourceUrl?: string,
  videoId?: string
): ShareParseFailure {
  return { ok: false, code, message, sourceUrl, videoId };
}

function extractFirstUrl(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const match = text.match(/https?:\/\/[^\s]+/i);
  if (!match) return null;

  return match[0].replace(/[),.;!?]+$/, '');
}

function parseTimestampToken(token: string | null): number | null {
  if (!token) return null;

  const normalized = token.trim().toLowerCase();
  if (!normalized) return null;

  if (/^\d+$/.test(normalized)) {
    const value = Number(normalized);
    return Number.isFinite(value) ? value : null;
  }

  if (/^\d+s$/.test(normalized)) {
    const value = Number(normalized.slice(0, -1));
    return Number.isFinite(value) ? value : null;
  }

  const match = normalized.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!match) return null;

  const [, h, m, s] = match;
  if (!h && !m && !s) return null;

  const hours = h ? Number(h) : 0;
  const mins = m ? Number(m) : 0;
  const secs = s ? Number(s) : 0;

  if ([hours, mins, secs].some((value) => !Number.isFinite(value))) {
    return null;
  }

  return hours * 3600 + mins * 60 + secs;
}

function parseVideoId(url: URL): { videoId: string | null; shorts: boolean } {
  const host = url.hostname.toLowerCase();

  if (!SUPPORTED_YOUTUBE_HOSTS.has(host)) {
    return { videoId: null, shorts: false };
  }

  if (host === 'youtu.be' || host === 'www.youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0] ?? null;
    return { videoId: id, shorts: false };
  }

  if (url.pathname.startsWith('/shorts/')) {
    return { videoId: null, shorts: true };
  }

  if (url.pathname === '/watch') {
    const id = url.searchParams.get('v');
    return { videoId: id, shorts: false };
  }

  if (url.pathname.startsWith('/live/')) {
    const id = url.pathname.split('/').filter(Boolean)[1] ?? null;
    return { videoId: id, shorts: false };
  }

  return { videoId: null, shorts: false };
}

function parseFromUrl(urlText: string): ShareParseResult {
  let url: URL;

  try {
    url = new URL(urlText);
  } catch {
    return failure('INVALID_URL', 'The shared text does not contain a valid URL.', urlText);
  }

  const { videoId, shorts } = parseVideoId(url);

  if (shorts) {
    return failure('UNSUPPORTED_SHORTS', 'YouTube Shorts links are not supported in V1.', urlText);
  }

  if (!videoId) {
    return failure('NOT_YOUTUBE', 'Only YouTube watch links are supported right now.', urlText);
  }

  const tToken = url.searchParams.get('t');
  if (!tToken) {
    return failure('MISSING_TIMESTAMP', 'The shared URL is missing the timestamp parameter `t`.', urlText, videoId);
  }

  const rawSeconds = parseTimestampToken(tToken);
  if (rawSeconds === null || rawSeconds < 0) {
    return failure('INVALID_TIMESTAMP', 'The timestamp format is invalid.', urlText);
  }

  const canonicalWatchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&t=${rawSeconds}s`;
  const success: ShareParseSuccess = {
    ok: true,
    videoId,
    rawSeconds,
    formattedTime: formatTime(rawSeconds),
    sourceUrl: urlText,
    canonicalWatchUrl
  };

  return success;
}

export function parseSharedTextForYouTubeTimestamp(sharedText: string): ShareParseResult {
  const text = sharedText?.trim() ?? '';
  if (!text) {
    return failure('NO_URL', 'Nothing was shared.');
  }

  const firstUrl = extractFirstUrl(text);
  if (!firstUrl) {
    return failure('NO_URL', 'No URL could be found in shared text.');
  }

  return parseFromUrl(firstUrl);
}

export function buildYouTubeWatchUrl(videoId: string, seconds: number): string {
  const safeSeconds = Number.isFinite(seconds) && seconds >= 0 ? Math.floor(seconds) : 0;
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&t=${safeSeconds}s`;
}
