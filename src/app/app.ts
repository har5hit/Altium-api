import Fastify, { type FastifyError, type FastifyInstance, type FastifyServerOptions } from 'fastify';
import fastifyEnv from '@fastify/env';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySensible from '@fastify/sensible';
import fastifyWebsocket from '@fastify/websocket';

import '@/app/types.js';
import envSchema from '@/app/config/env.js';
import { RATE_LIMIT } from '@/app/config/constants.js';
import plugins from '@/app/plugins/index.js';
import { setupDi } from '@/app/di.js';
import routes from '@/app/routes/index.js';
import logger from '@/app/logger.js';

export async function buildApp(opts: FastifyServerOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    ...opts,
    ...(opts.logger ? {} : { loggerInstance: logger }),
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

  // Dependency injection container
  setupDi(app);

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
