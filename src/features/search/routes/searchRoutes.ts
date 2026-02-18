import type { FastifyInstance } from 'fastify';
import { makeSearchController } from '@/features/search/controllers/searchController.js';
import { SearchFootballInputSchema, SearchFootballOutputSchema } from '@/features/search/usecases/SearchFootball.js';

export default async function searchRoutes(fastify: FastifyInstance) {
  const controller = makeSearchController(fastify);

  fastify.get(
    '/search',
    {
      schema: {
        tags: ['football-search'],
        querystring: SearchFootballInputSchema,
        response: { 200: SearchFootballOutputSchema },
      },
    },
    controller.search
  );
}
