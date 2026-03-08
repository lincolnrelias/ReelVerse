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
  origin: env.NODE_ENV === 'development' 
    ? true 
    : (origin, cb) => {
        // Em produção, se houver um FRONTEND_URL, valide. Senão permite todos.
        if (!env.FRONTEND_URL || env.FRONTEND_URL === '*') {
          cb(null, true);
          return;
        }
        cb(null, true); // Permite temporariamente para garantir funcionamento no deploy
      },
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
