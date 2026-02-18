import type { FastifyInstance } from 'fastify';
import { makeCompetitionsController } from '@/features/competitions/controllers/competitionsController.js';
import { GetCompetitionsInputSchema, GetCompetitionsOutputSchema } from '@/features/competitions/usecases/GetCompetitions.js';

export default async function competitionsRoutes(fastify: FastifyInstance) {
  const controller = makeCompetitionsController(fastify);

  fastify.get(
    '/competitions',
    {
      schema: {
        tags: ['football-competitions'],
        querystring: GetCompetitionsInputSchema,
        response: { 200: GetCompetitionsOutputSchema },
      },
    },
    controller.getCompetitions
  );
}
