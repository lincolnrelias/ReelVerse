/**
 * Regex to extract YouTube video ID from any common format
 * (shorts, watch, youtu.be, mobile m.youtube.com, etc.)
 */
const YOUTUBE_VIDEO_ID_REGEX =
  /(?:https?:\/\/)?(?:(?:www|m)\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/;

/**
 * Normalizes any YouTube URL (mobile, desktop, shorts, watch, youtu.be)
 * to the canonical form: https://www.youtube.com/shorts/VIDEO_ID
 * so that storage and API calls are consistent.
 */
export function normalizeYoutubeShortUrl(url: string): string {
  const trimmed = url.trim();
  const match = trimmed.match(YOUTUBE_VIDEO_ID_REGEX);
  const videoId = match ? match[1] : null;
  if (!videoId) {
    throw new Error('URL inválida: não foi possível extrair o ID do vídeo YouTube.');
  }
  return `https://www.youtube.com/shorts/${videoId}`;
}
