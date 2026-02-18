import type { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';
import { makeStandingsController } from '@/features/standings/controllers/standingsController.js';
import { GetStandingsOutputSchema } from '@/features/standings/usecases/GetStandings.js';

const standingsParams = Type.Object({
  competitionId: Type.Integer(),
});

const standingsQuery = Type.Object({
  season: Type.String({ minLength: 4, maxLength: 16 }),
});

export default async function standingsRoutes(fastify: FastifyInstance) {
  const controller = makeStandingsController(fastify);

  fastify.get(
    '/competitions/:competitionId/standings',
    {
      schema: {
        tags: ['football-standings'],
        params: standingsParams,
        querystring: standingsQuery,
        response: { 200: GetStandingsOutputSchema },
      },
    },
    controller.getStandings
  );
}
