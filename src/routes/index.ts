import type { FastifyInstance } from 'fastify';
import { API_PREFIX } from '../config/constants.js';
import userRoutes from './users/routes.js';
import authRoutes from './auth/routes.js';
import wsRoutes from './ws/routes.js';

export default async function routes(fastify: FastifyInstance) {
  fastify.get('/health', async () => ({ status: 'ok' }));

  fastify.register(userRoutes, { prefix: `${API_PREFIX}/users` });
  fastify.register(authRoutes, { prefix: `${API_PREFIX}/auth` });
  fastify.register(wsRoutes, { prefix: `${API_PREFIX}/ws` });
}
