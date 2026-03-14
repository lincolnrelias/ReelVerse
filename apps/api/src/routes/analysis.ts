import { FastifyInstance } from 'fastify';
import { eq, and, gte, desc } from 'drizzle-orm';
import { createAnalysisSchema, normalizeYoutubeShortUrl } from '@reelverse/shared';
import type { AnalysisStatus } from '@reelverse/shared';
import { analyses } from '../db/schema.js';
import type { Db } from '../db/index.js';
import { analysisQueue } from '../queue.js';
import { env } from '../env.js';

const CACHE_CHECK_HOURS = 24;

const RATE_LIMIT_WINDOW = 3600; // 1 hour in seconds
const RATE_LIMIT_MAX = 5;

export async function analysisRoutes(
  app: FastifyInstance,
  opts: { db: Db; getRedis: () => import('ioredis').default }
) {
  const { db, getRedis } = opts;

  // Rate limit: 5 analyses per hour per IP (only for POST /api/analysis).
  // Desativado em ambiente de desenvolvimento.
  if (env.NODE_ENV !== 'development') {
    app.addHook('preHandler', async (request, reply) => {
      const path = request.url?.split('?')[0] ?? '';
      if (request.method !== 'POST' || path !== '/api/analysis') return;
      const ip = request.ip ?? request.headers['x-forwarded-for'] ?? 'unknown';
      const key = `ratelimit:analysis:${ip}`;
      const redis = getRedis();
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, RATE_LIMIT_WINDOW);
      if (count > RATE_LIMIT_MAX) {
        return reply.status(429).send({
          error: 'Limite excedido',
          message: 'Máximo de 5 análises por hora. Tente novamente mais tarde.',
        });
      }
    });
  }

  app.post<{ Body: unknown }>('/api/analysis', async (request, reply) => {
    const parsed = createAnalysisSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Validação falhou',
        message: 'URL deve ser um YouTube Short válido (youtube.com/shorts/... ou youtu.be/...)',
      });
    }
    const { videoUrl, language } = parsed.data;

    const [row] = await db
      .insert(analyses)
      .values({
        videoUrl,
        status: 'pending',
      })
      .returning({ id: analyses.id, status: analyses.status, createdAt: analyses.createdAt });

    if (!row) {
      return reply.status(500).send({
        error: 'Erro interno',
        message: 'Não foi possível criar a análise.',
      });
    }

    await analysisQueue.add(
      'analyze' as const,
      { analysisId: row.id, videoUrl, language: language as 'pt' | 'en' }
    );

    return reply.status(201).send({
      id: row.id,
      status: row.status,
      createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    });
  });

  app.get<{ Querystring: { videoUrl?: string } }>('/api/analysis/cache-check', async (request, reply) => {
    const rawUrl = request.query.videoUrl;
    if (!rawUrl || typeof rawUrl !== 'string') {
      return reply.send({ cached: false });
    }
    let videoUrl: string;
    try {
      videoUrl = normalizeYoutubeShortUrl(rawUrl);
    } catch {
      return reply.send({ cached: false });
    }
    const since = new Date(Date.now() - CACHE_CHECK_HOURS * 60 * 60 * 1000);
    const [row] = await db
      .select({ id: analyses.id })
      .from(analyses)
      .where(and(eq(analyses.videoUrl, videoUrl), eq(analyses.status, 'completed'), gte(analyses.completedAt, since)))
      .orderBy(desc(analyses.completedAt))
      .limit(1);
    if (row) {
      return reply.send({ cached: true, analysisId: row.id });
    }
    return reply.send({ cached: false });
  });

  app.get<{ Params: { id: string } }>('/api/analysis/:id', async (request, reply) => {
    const { id } = request.params;
    const [row] = await db.select().from(analyses).where(eq(analyses.id, id)).limit(1);

    if (!row) {
      return reply.status(404).send({
        error: 'Não encontrado',
        message: 'Análise não encontrada.',
      });
    }

    const status: AnalysisStatus = {
      id: row.id,
      status: row.status,
      createdAt: row.createdAt?.toISOString() ?? '',
      ...(row.errorMessage && { errorMessage: row.errorMessage }),
      ...(row.videoMeta && { videoMeta: row.videoMeta }),
      ...(row.result && { result: row.result }),
      ...(row.processingTimeMs != null && { processingTimeMs: row.processingTimeMs }),
      ...(row.completedAt && { completedAt: row.completedAt.toISOString() }),
    };

    return reply.send(status);
  });
}
