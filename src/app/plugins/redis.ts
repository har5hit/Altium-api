import fp from 'fastify-plugin';
import fastifyRedis from '@fastify/redis';
import type { FastifyInstance } from 'fastify';

async function redisPlugin(fastify: FastifyInstance) {
  await fastify.register(fastifyRedis, {
    url: fastify.config.REDIS_URL,
  });
}

export default fp(redisPlugin, { name: 'redis' });
