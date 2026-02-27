export interface YouTubeMetadata {
  title: string;
  thumbnailUrl: string;
}

function fallbackThumbnail(videoId: string): string {
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
}

export async function fetchYouTubeMetadata(videoId: string, timeoutMs = 5000): Promise<YouTubeMetadata> {
  const canonicalUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(canonicalUrl)}&format=json`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`oEmbed request failed (${response.status})`);
    }

    const payload = (await response.json()) as { title?: string; thumbnail_url?: string };

    return {
      title: payload.title?.trim() || `YouTube video ${videoId}`,
      thumbnailUrl: payload.thumbnail_url?.trim() || fallbackThumbnail(videoId)
    };
  } catch {
    return {
      title: `YouTube video ${videoId}`,
      thumbnailUrl: fallbackThumbnail(videoId)
    };
  } finally {
    clearTimeout(timeout);
  }
}
