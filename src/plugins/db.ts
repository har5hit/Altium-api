import fp from 'fastify-plugin';
import fastifyPostgres from '@fastify/postgres';
import type { FastifyInstance } from 'fastify';

async function dbPlugin(fastify: FastifyInstance) {
  await fastify.register(fastifyPostgres, {
    connectionString: fastify.config.DATABASE_URL,
  });
}

export default fp(dbPlugin, { name: 'db' });
