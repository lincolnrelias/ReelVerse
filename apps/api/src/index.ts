import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { createDb } from './db/index.js';
import { analysisRoutes } from './routes/analysis.js';
import { env } from './env.js';
import { getRedis } from './queue.js';

const db = createDb(env.DATABASE_URL);

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: [
    'http://localhost:3000',
    /^http:\/\/127\.0\.0\.1:\d+$/,
  ],
  credentials: true,
});
await app.register(sensible);

app.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  const statusCode = (error as { statusCode?: number }).statusCode ?? 500;
  const message =
    statusCode === 500
      ? 'Ocorreu um erro interno. Tente novamente mais tarde.'
      : (error.message ?? 'Erro desconhecido');
  reply.status(statusCode).send({ error: 'Erro', message });
});

await app.register(analysisRoutes, { db, getRedis });

app.listen({ port: env.PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
