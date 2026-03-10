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

  // Usando a API "Social Media Video Downloader" do RapidAPI
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': env.RAPIDAPI_KEY,
      'x-rapidapi-host': 'social-media-video-downloader.p.rapidapi.com'
    }
  };

  const response = await fetch(`https://social-media-video-downloader.p.rapidapi.com/youtube/v3/video/details?videoId=${videoId}&renderableFormats=720p%2Chighres&urlAccess=proxied`, options);
  
  if (!response.ok) {
    throw new Error(`Falha ao obter dados da API (Status: ${response.status})`);
  }

  const raw = await response.json() as any;

  if (!raw.contents || !raw.contents[0] || !raw.metadata) {
    throw new Error('A API retornou dados inválidos ou o vídeo não pôde ser processado.');
  }

  const videoData = raw.metadata;
  
  const meta: VideoMeta = {
    title: videoData.title || '',
    description: '', // Description is often removed in v3 of this API to save payload size
    channelName: videoData.author?.name || '',
    channelUrl: videoData.author?.endpoint?.metadata?.url ? `https://youtube.com${videoData.author.endpoint.metadata.url}` : '',
    publishDate: '', // Also often omitted in the simplified metadata payload
    duration: 0, 
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    hashtags: [],
    thumbnailUrl: videoData.thumbnailUrl || '',
    videoId: videoId,
  };

  // Find best MP4 video (Proxied URL)
  const videos = raw.contents[0].videos || [];
  
  // Prefer 1080p, then 720p, falling back to whatever is available
  let bestFormat = videos.find((v: any) => v.label === '1080p' && v.url.includes('.mp4'));
  if (!bestFormat) bestFormat = videos.find((v: any) => v.label === '720p' && v.url.includes('.mp4'));
  if (!bestFormat) bestFormat = videos.find((v: any) => v.url.includes('.mp4'));

  if (!bestFormat || !bestFormat.url) {
    throw new Error('Nenhum formato MP4 proxied adequado foi retornado pela API.');
  }

  const downloadUrl = bestFormat.url;
  const videoPath = path.join(tempDir, `${meta.videoId}.mp4`);

  // Stream download directly from the smvd.xyz proxied URL
  const videoResponse = await fetch(downloadUrl);

  if (!videoResponse.ok) {
    throw new Error(`Falha ao baixar o arquivo final do vídeo (Status ${videoResponse.status})`);
  }

  await pipeline(videoResponse.body as any, fs.createWriteStream(videoPath));

  return { videoPath, meta };
}
