export type YouTubeOpenPlatform = 'android' | 'ios' | 'web';

function normalizeSeconds(seconds: number): number {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return 0;
  }

  return Math.floor(seconds);
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

export function buildYouTubeOpenCandidates(
  videoId: string,
  seconds: number,
  platform: YouTubeOpenPlatform
): string[] {
  const safeVideoId = encodeURIComponent(videoId.trim());
  const safeSeconds = normalizeSeconds(seconds);

  const watchUrl = `https://www.youtube.com/watch?v=${safeVideoId}&t=${safeSeconds}s&time_continue=${safeSeconds}`;
  const shortUrl = `https://youtu.be/${safeVideoId}?t=${safeSeconds}`;

  if (platform === 'android') {
    return unique([
      `vnd.youtube://${safeVideoId}?t=${safeSeconds}&time_continue=${safeSeconds}`,
      `youtube://watch?v=${safeVideoId}&t=${safeSeconds}s&time_continue=${safeSeconds}`,
      `youtube://www.youtube.com/watch?v=${safeVideoId}&t=${safeSeconds}s&time_continue=${safeSeconds}`,
      `intent://www.youtube.com/watch?v=${safeVideoId}&t=${safeSeconds}s&time_continue=${safeSeconds}#Intent;package=com.google.android.youtube;scheme=https;end`,
      watchUrl,
      shortUrl
    ]);
  }

  if (platform === 'ios') {
    return unique([
      `youtube://watch?v=${safeVideoId}&t=${safeSeconds}s&time_continue=${safeSeconds}`,
      `youtube://www.youtube.com/watch?v=${safeVideoId}&t=${safeSeconds}s&time_continue=${safeSeconds}`,
      watchUrl,
      shortUrl
    ]);
  }

  return unique([watchUrl, shortUrl]);
}
