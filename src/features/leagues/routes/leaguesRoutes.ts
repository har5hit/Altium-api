import type { FastifyInstance } from 'fastify';
import { makeLeaguesController } from '@/features/leagues/controllers/leaguesController.js';
import { GetLeaguesInputSchema, GetLeaguesOutputSchema } from '@/features/leagues/usecases/GetLeagues.js';

export default async function leaguesRoutes(fastify: FastifyInstance) {
  const controller = makeLeaguesController(fastify);

  fastify.get(
    '/leagues',
    {
      schema: {
        tags: ['football-leagues'],
        querystring: GetLeaguesInputSchema,
        response: { 200: GetLeaguesOutputSchema },
      },
    },
    controller.getLeagues
  );
}
