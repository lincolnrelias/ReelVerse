import path from 'path';
import fs from 'fs/promises';
import type { VideoMeta } from '@reelverse/shared';
import { execCommand } from '../lib/exec.js';

function extractHashtags(description: string): string[] {
  if (!description || typeof description !== 'string') return [];
  const matches = description.match(/#[\w\u00C0-\u024F]+/g);
  return matches ? [...new Set(matches)] : [];
}

export async function extractVideo(
  videoUrl: string,
  tempDir: string
): Promise<{ videoPath: string; meta: VideoMeta }> {
  const metaJson = await execCommand('yt-dlp', ['--dump-json', videoUrl], {
    timeout: 30000,
  });
  const raw = JSON.parse(metaJson) as Record<string, unknown>;

  const meta: VideoMeta = {
    title: (raw.title as string) || '',
    description: (raw.description as string) || '',
    channelName: (raw.channel as string) || (raw.uploader as string) || '',
    channelUrl: (raw.channel_url as string) || '',
    publishDate: (raw.upload_date as string) || '',
    duration: Number(raw.duration) || 0,
    viewCount: Number(raw.view_count) || 0,
    likeCount: Number(raw.like_count) || 0,
    commentCount: Number(raw.comment_count) || 0,
    hashtags: extractHashtags((raw.description as string) || ''),
    thumbnailUrl: (raw.thumbnail as string) || '',
    videoId: (raw.id as string) || '',
  };

  const videoPath = path.join(tempDir, `${meta.videoId}.mp4`);
  await execCommand(
    'yt-dlp',
    [
      '-f',
      'bestvideo[height<=720]+bestaudio/best[height<=720]',
      '--merge-output-format',
      'mp4',
      '-o',
      videoPath,
      videoUrl,
    ],
    { timeout: 120000 }
  );

  const exists = await fs.stat(videoPath).catch(() => null);
  if (!exists || !exists.isFile()) {
    throw new Error('Vídeo não foi baixado corretamente');
  }

  return { videoPath, meta };
}
