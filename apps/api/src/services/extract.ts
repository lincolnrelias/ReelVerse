import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import fetch from 'node-fetch';
import { exec } from 'child_process';
import util from 'util';
import type { VideoMeta } from '@reelverse/shared';
import { env } from '../env.js';

const execPromise = util.promisify(exec);

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
  const add = videoData?.additionalData || {};
  
  const parseViewCount = (text?: string) => {
      if (!text) return 0;
      const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
      return isNaN(num) ? 0 : num;
  };

  const meta: VideoMeta = {
    title: videoData.title || '',
    description: add.short_description || '',
    channelName: videoData.author?.name || '',
    channelUrl: videoData.author?.endpoint?.metadata?.url ? `https://youtube.com${videoData.author.endpoint.metadata.url}` : '',
    publishDate: add.published?.text || '',
    duration: add.duration ? Number(add.duration) : 0, 
    viewCount: parseViewCount(add.view_count?.view_count?.text || add.view_count?.original_view_count),
    likeCount: add.like_count ? Number(add.like_count) : 0,
    commentCount: 0,
    hashtags: extractHashtags(add.short_description || videoData.title || ''),
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

  // Find best audio
  const audios = raw.contents[0].audios || [];
  let bestAudioFormat = audios.find((a: any) => a.metadata?.mime_type?.includes('audio/mp4'));
  if (!bestAudioFormat) bestAudioFormat = audios[0];

  if (!bestAudioFormat || !bestAudioFormat.url) {
    console.warn('Nenhum formato de áudio adequado encontrado, será baixado apenas o vídeo mudo.');
  }

  const downloadVideoUrl = bestFormat.url;
  const downloadAudioUrl = bestAudioFormat?.url;
  
  const videoOnlyPath = path.join(tempDir, `${meta.videoId}_video_only.mp4`);
  const audioOnlyPath = path.join(tempDir, `${meta.videoId}_audio_only.mp4`);
  const videoPath = path.join(tempDir, `${meta.videoId}.mp4`);

  // Stream video
  const videoResponse = await fetch(downloadVideoUrl);
  if (!videoResponse.ok) {
    throw new Error(`Falha ao baixar o arquivo de vídeo original (Status ${videoResponse.status})`);
  }
  await pipeline(videoResponse.body as any, fs.createWriteStream(videoOnlyPath));

  // Stream audio if available
  if (downloadAudioUrl) {
    const audioResponse = await fetch(downloadAudioUrl);
    if (!audioResponse.ok) {
        throw new Error(`Falha ao baixar o arquivo de áudio original (Status ${audioResponse.status})`);
    }
    await pipeline(audioResponse.body as any, fs.createWriteStream(audioOnlyPath));

    // Muxing them together using FFmpeg
    try {
      await execPromise(`ffmpeg -i "${videoOnlyPath}" -i "${audioOnlyPath}" -c:v copy -c:a aac "${videoPath}"`);
    } catch (ffmpegErr) {
      console.error('Falha ao rodar o ffmpeg para juntar video e audio', ffmpegErr);
      throw new Error('Falha ao fazer muxing de video + audio com ffmpeg');
    }

    // Clean up temporary files
    if (fs.existsSync(videoOnlyPath)) fs.unlinkSync(videoOnlyPath);
    if (fs.existsSync(audioOnlyPath)) fs.unlinkSync(audioOnlyPath);
  } else {
    // If no audio downloaded, just rename videoOnly to final video path
    fs.renameSync(videoOnlyPath, videoPath);
  }

  return { videoPath, meta };
}
