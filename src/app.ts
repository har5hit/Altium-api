import Fastify, { type FastifyError, type FastifyInstance, type FastifyServerOptions } from 'fastify';
import fastifyEnv from '@fastify/env';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySensible from '@fastify/sensible';
import fastifyWebsocket from '@fastify/websocket';

import './types.js';
import envSchema from './config/env.js';
import { RATE_LIMIT } from './config/constants.js';
import plugins from './plugins/index.js';
import routes from './routes/index.js';
import logger from './utils/logger.js';

export async function buildApp(opts: FastifyServerOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: opts.logger ?? logger,
    ...opts,
  });

  // Environment config
  await app.register(fastifyEnv, { schema: envSchema, dotenv: true, confKey: 'config' });

  // Security
  await app.register(fastifyCors);
  await app.register(fastifyHelmet);
  await app.register(fastifyRateLimit, RATE_LIMIT);

  // Utilities
  await app.register(fastifySensible);

  // WebSocket
  await app.register(fastifyWebsocket);

  // App plugins (db, redis, auth)
  await app.register(plugins);

  // Routes
  await app.register(routes);

  // Global error handler
  app.setErrorHandler((error: FastifyError, request, reply) => {
    const statusCode = error.statusCode ?? 500;
    request.log.error(error);
    reply.status(statusCode).send({
      error: error.name,
      message: error.message,
      statusCode,
    });
  });

  return app;
}
