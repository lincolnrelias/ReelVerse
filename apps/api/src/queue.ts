import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { env } from './env.js';

const redisUrl = new URL(env.REDIS_URL);
const connection = {
  host: redisUrl.hostname,
  port: redisUrl.port ? parseInt(redisUrl.port, 10) : 6379,
  password: redisUrl.password || undefined,
};

export const analysisQueue = new Queue<{ analysisId: string; videoUrl: string }>(
  'analysis',
  {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  }
);

const redisClient = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
export function getRedis(): Redis {
  return redisClient;
}
