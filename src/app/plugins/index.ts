import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import dbPlugin from '@/app/plugins/db.js';
import redisPlugin from '@/app/plugins/redis.js';
import authPlugin from '@/app/plugins/auth.js';
import swaggerPlugin from '@/app/plugins/swagger.js';
import footballIngestPlugin from '@/app/plugins/footballIngest.js';

async function plugins(fastify: FastifyInstance) {
  if (fastify.config.DATABASE_URL) {
    await fastify.register(dbPlugin);
  } else {
    fastify.log.warn('DATABASE_URL not set — skipping PostgreSQL plugin');
  }

  if (fastify.config.REDIS_URL) {
    await fastify.register(redisPlugin);
  } else {
    fastify.log.warn('REDIS_URL not set — skipping Redis plugin');
  }

  await fastify.register(authPlugin);
  await fastify.register(swaggerPlugin);
  await fastify.register(footballIngestPlugin);
}

export default fp(plugins, { name: 'plugins' });
