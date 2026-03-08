import path from 'path';
import fs from 'fs/promises';
import type { FrameAnalysisData } from '@reelverse/shared';
import { execCommand, parseSceneDetection, getVideoDuration } from '../lib/exec.js';

export async function processVideo(
  videoPath: string,
  tempDir: string
): Promise<{
  audioPath: string;
  framesDir: string;
  cutTimestamps: number[];
  duration: number;
  frameAnalysis: FrameAnalysisData;
}> {
  const audioPath = path.join(tempDir, 'audio.mp3');
  const framesDir = path.join(tempDir, 'frames');
  await fs.mkdir(framesDir, { recursive: true });

  await execCommand(
    'ffmpeg',
    ['-i', videoPath, '-vn', '-acodec', 'libmp3lame', '-q:a', '4', audioPath],
    { timeout: 60000 }
  );

  await execCommand(
    'ffmpeg',
    [
      '-i',
      videoPath,
      '-vf',
      'fps=1',
      '-q:v',
      '3',
      path.join(framesDir, 'frame_%03d.jpg'),
    ],
    { timeout: 60000 }
  );

  let sceneOutput = '';
  try {
    sceneOutput = await execCommand(
      'ffmpeg',
      [
        '-i',
        videoPath,
        '-filter:v',
        "select='gt(scene,0.3)',showinfo",
        '-f',
        'null',
        '-',
      ],
      { timeout: 60000, captureStderr: true }
    );
  } catch {
    // scene detection may fail on short videos; continue with empty cuts
  }

  const cutTimestamps = parseSceneDetection(sceneOutput);
  const duration = await getVideoDuration(videoPath);

  const frameFiles = (await fs.readdir(framesDir))
    .filter((f) => f.endsWith('.jpg'))
    .sort();
  const totalFrames = frameFiles.length;

  const frameAnalysis: FrameAnalysisData = {
    totalFramesAnalyzed: totalFrames,
    cutTimestamps,
    cutFrequencyPerSecond: duration > 0 ? cutTimestamps.length / duration : 0,
    textOverlays: [],
    visualElements: [],
    framingPatterns: [],
  };

  return {
    audioPath,
    framesDir,
    cutTimestamps,
    duration,
    frameAnalysis,
  };
}
