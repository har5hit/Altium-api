import type { FastifyInstance } from 'fastify';
import { API_PREFIX } from '@/app/config/constants.js';
import userRoutes from '@/features/users/routes/userRoutes.js';
import wsRoutes from '@/features/ws/routes/wsRoutes.js';
import homeFeedRoutes from '@/features/home-feed/routes/homeFeedRoutes.js';
import leaguesRoutes from '@/features/leagues/routes/leaguesRoutes.js';
import standingsRoutes from '@/features/standings/routes/standingsRoutes.js';
import matchesRoutes from '@/features/matches/routes/matchesRoutes.js';
import teamsRoutes from '@/features/teams/routes/teamsRoutes.js';
import searchRoutes from '@/features/search/routes/searchRoutes.js';

const healthResponseSchema = {
  type: 'object' as const,
  properties: {
    status: { type: 'string' as const },
  },
};

export default async function routes(fastify: FastifyInstance) {
  fastify.get(
    '/health',
    {
      schema: {
        tags: ['health'],
        response: { 200: healthResponseSchema },
      },
    },
    async () => ({ status: 'ok' })
  );
  fastify.get(
    `${API_PREFIX}/health`,
    {
      schema: {
        tags: ['health'],
        response: { 200: healthResponseSchema },
      },
    },
    async () => ({ status: 'ok' })
  );

  fastify.register(userRoutes, { prefix: `${API_PREFIX}/users` });
  fastify.register(homeFeedRoutes, { prefix: `${API_PREFIX}/football` });
  fastify.register(leaguesRoutes, { prefix: `${API_PREFIX}/football` });
  fastify.register(standingsRoutes, { prefix: `${API_PREFIX}/football` });
  fastify.register(matchesRoutes, { prefix: `${API_PREFIX}/football` });
  fastify.register(teamsRoutes, { prefix: `${API_PREFIX}/football` });
  fastify.register(searchRoutes, { prefix: `${API_PREFIX}/football` });
  fastify.register(wsRoutes, { prefix: `${API_PREFIX}/ws` });
}
