import type { FastifyInstance } from 'fastify';
import { makeAuthController } from './controller.js';
import { lookupSchema } from './schema.js';

export default async function authRoutes(fastify: FastifyInstance) {
  const controller = makeAuthController(fastify);

  fastify.post('/lookup', { schema: lookupSchema }, controller.lookup);
}
