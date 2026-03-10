import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import fetch from 'node-fetch';
import type { VideoMeta } from '@reelverse/shared';
import { env } from '../env.js';

function extractHashtags(description: string): string[] {
  if (!description || typeof description !== 'string') return [];
  const matches = description.match(/#[\w\u00C0-\u024F]+/g);
  return matches ? [...new Set(matches)] : [];
}

function extractVideoId(url: string): string | null {
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})|youtube\.com\/shorts\/([^"&?\/\s]{11})/;
  const match = url.match(ytRegex);
  return match ? (match[1] || match[2]) : null;
}

export async function extractVideo(
  videoUrl: string,
  tempDir: string
): Promise<{ videoPath: string; meta: VideoMeta }> {
  
  if (!env.RAPIDAPI_KEY) {
    throw new Error('RAPIDAPI_KEY não configurada no ambiente.');
  }

  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    throw new Error('URL inválida ou ID do vídeo não encontrado.');
  }

  // Usando a API "YouTube Media Downloader" do RapidAPI
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': env.RAPIDAPI_KEY,
      'x-rapidapi-host': 'youtube-media-downloader.p.rapidapi.com'
    }
  };

  const response = await fetch(`https://youtube-media-downloader.p.rapidapi.com/v2/video/details?videoId=${videoId}`, options);
  
  if (!response.ok) {
    throw new Error(`Falha ao obter dados da API (Status: ${response.status})`);
  }

  const raw = await response.json() as any;

  if (raw.errorId !== 'Success' && !raw.title) {
    throw new Error('A API retornou dados inválidos ou o vídeo não pôde ser processado.');
  }

  const meta: VideoMeta = {
    title: raw.title || '',
    description: raw.description || '',
    channelName: raw.channel?.name || '',
    channelUrl: raw.channel?.handle ? `https://youtube.com/${raw.channel.handle}` : `https://youtube.com/channel/${raw.channel?.id}`,
    publishDate: raw.publishedTime || '',
    duration: raw.lengthSeconds ? Number(raw.lengthSeconds) : 0,
    viewCount: Number(raw.viewCount) || 0,
    likeCount: Number(raw.likeCount) || 0,
    commentCount: 0,
    hashtags: extractHashtags(raw.description || ''),
    thumbnailUrl: raw.thumbnails?.[raw.thumbnails.length - 1]?.url || '',
    videoId: videoId,
  };

  // Find best MP4 video with audio
  const videos = raw.videos?.items || [];
  const bestFormat = videos.find((v: any) => v.extension === 'mp4' && v.hasAudio) || videos.find((v: any) => v.extension === 'mp4');

  if (!bestFormat || !bestFormat.url) {
    throw new Error('Nenhum formato MP4 adequado foi retornado pela API.');
  }

  const downloadUrl = bestFormat.url;
  const videoPath = path.join(tempDir, `${meta.videoId}.mp4`);

  // Stream download directly from the RapidAPI CDN URL
  const videoResponse = await fetch(downloadUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5',
      'Accept-Language': 'en-US,en;q=0.5',
      'Referer': 'https://www.youtube.com/'
    }
  });

  if (!videoResponse.ok) {
    throw new Error(`Falha ao baixar o arquivo final do vídeo (Status ${videoResponse.status})`);
  }

  await pipeline(videoResponse.body as any, fs.createWriteStream(videoPath));

  return { videoPath, meta };
}
