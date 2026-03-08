import path from 'path';
import fs from 'fs/promises';
import { Worker, Job } from 'bullmq';
import { eq } from 'drizzle-orm';
import { analyses } from '../db/schema.js';
import { createDb } from '../db/index.js';
import { env } from '../env.js';
import { extractVideo } from '../services/extract.js';
import { processVideo } from '../services/processVideo.js';
import { transcribeAudio } from '../services/transcribe.js';
import { analyzeFrames } from '../services/frameAnalysis.js';
import { analyzeWithAI } from '../services/analyze.js';
import { execCommand } from '../lib/exec.js';

const db = createDb(env.DATABASE_URL);

interface AnalysisJobData {
  analysisId: string;
  videoUrl: string;
}

async function ensureBinaries(): Promise<void> {
  try {
    await execCommand('yt-dlp', ['--version'], { timeout: 5000 });
  } catch {
    throw new Error('yt-dlp não encontrado. Instale-o globalmente (pip install yt-dlp ou pacote do sistema).');
  }
  try {
    await execCommand('ffmpeg', ['-version'], { timeout: 5000 });
  } catch {
    throw new Error('FFmpeg não encontrado. Instale-o globalmente.');
  }
}

export async function processAnalysisJob(job: Job<AnalysisJobData, void, string>): Promise<void> {
  const { analysisId, videoUrl } = job.data;
  const tempDir = path.join(env.TEMP_DIR, analysisId);
  const startTime = Date.now();

  await fs.mkdir(tempDir, { recursive: true });

  try {
    await db.update(analyses).set({ status: 'extracting' }).where(eq(analyses.id, analysisId));
    await job.updateProgress(10);

    const { videoPath, meta } = await extractVideo(videoUrl, tempDir);
    await db
      .update(analyses)
      .set({ status: 'extracting', videoMeta: meta })
      .where(eq(analyses.id, analysisId));
    await job.updateProgress(20);

    await db.update(analyses).set({ status: 'processing_video' }).where(eq(analyses.id, analysisId));

    const { audioPath, framesDir, cutTimestamps, duration, frameAnalysis: baseFrameAnalysis } = await processVideo(
      videoPath,
      tempDir
    );
    await job.updateProgress(40);

    let frameAnalysis = baseFrameAnalysis;
    try {
      frameAnalysis = await analyzeFrames(framesDir, cutTimestamps, duration);
    } catch (e) {
      console.warn('Frame analysis (Vision) failed, using base:', e);
    }

    await db
      .update(analyses)
      .set({ status: 'processing_video', frameAnalysis })
      .where(eq(analyses.id, analysisId));
    await job.updateProgress(50);

    await db.update(analyses).set({ status: 'transcribing' }).where(eq(analyses.id, analysisId));

    const transcription = await transcribeAudio(audioPath);
    await db
      .update(analyses)
      .set({ status: 'transcribing', transcription })
      .where(eq(analyses.id, analysisId));
    await job.updateProgress(70);

    await db.update(analyses).set({ status: 'analyzing' }).where(eq(analyses.id, analysisId));

    const result = await analyzeWithAI({ meta, transcription, frameAnalysis });
    const processingTimeMs = Date.now() - startTime;

    await db
      .update(analyses)
      .set({
        status: 'completed',
        result,
        completedAt: new Date(),
        processingTimeMs,
      })
      .where(eq(analyses.id, analysisId));
    await job.updateProgress(100);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db
      .update(analyses)
      .set({ status: 'failed', errorMessage: message })
      .where(eq(analyses.id, analysisId));
    throw err;
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

export async function startAnalysisWorker(): Promise<void> {
  await ensureBinaries();

  const redisUrl = new URL(env.REDIS_URL);
  const connection = {
    host: redisUrl.hostname,
    port: redisUrl.port ? parseInt(redisUrl.port, 10) : 6379,
    password: redisUrl.password || undefined,
  };

  const worker = new Worker<AnalysisJobData, void, string>(
    'analysis',
    async (job) => processAnalysisJob(job),
    {
      connection,
      concurrency: 2,
      limiter: { max: 5, duration: 60000 },
      lockDuration: 10 * 60 * 1000,     // 10 min — evita stall em jobs longos (transcrição)
      lockRenewTime: 2 * 60 * 1000,     // renova lock a cada 2 min
      stalledInterval: 5 * 60 * 1000,   // checa stalls a cada 5 min
    }
  );

  worker.on('completed', (job) => console.log(`Job ${job.id} completed`));
  worker.on('failed', (job, err) => console.error(`Job ${job?.id} failed:`, err));

  console.log('Analysis worker started');
}
