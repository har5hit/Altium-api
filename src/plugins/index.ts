import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import dbPlugin from './db.js';
import redisPlugin from './redis.js';
import authPlugin from './auth.js';

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
}

export default fp(plugins, { name: 'plugins' });
