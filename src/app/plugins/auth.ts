import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { UnauthorizedError } from '@/app/errors.js';

async function authPlugin(fastify: FastifyInstance) {
  fastify.decorate('verifyApiKey', async (request: FastifyRequest) => {
    const apiKey = fastify.config.API_KEY;
    if (!apiKey) return;

    const provided = request.headers['x-api-key'];
    if (provided !== apiKey) {
      throw new UnauthorizedError('Invalid API key');
    }
  });
}

export default fp(authPlugin, { name: 'auth' });
