import type { FastifyInstance } from 'fastify';
import { makeMatchesController } from '@/features/matches/controllers/matchesController.js';
import { GetLiveMatchesInputSchema, GetLiveMatchesOutputSchema } from '@/features/matches/usecases/GetLiveMatches.js';
import { GetMatchByIdInputSchema, GetMatchByIdOutputSchema } from '@/features/matches/usecases/GetMatchById.js';

export default async function matchesRoutes(fastify: FastifyInstance) {
  const controller = makeMatchesController(fastify);

  fastify.get(
    '/matches/live',
    {
      schema: {
        tags: ['football-matches'],
        querystring: GetLiveMatchesInputSchema,
        response: { 200: GetLiveMatchesOutputSchema },
      },
    },
    controller.getLiveMatches
  );

  fastify.get(
    '/matches/:matchId',
    {
      schema: {
        tags: ['football-matches'],
        params: GetMatchByIdInputSchema,
        response: { 200: GetMatchByIdOutputSchema },
      },
    },
    controller.getMatchById
  );
}
