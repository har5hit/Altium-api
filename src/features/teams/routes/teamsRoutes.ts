import type { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';
import { makeTeamsController } from '@/features/teams/controllers/teamsController.js';
import { GetTeamByIdInputSchema, GetTeamByIdOutputSchema } from '@/features/teams/usecases/GetTeamById.js';
import { GetTeamFixturesOutputSchema } from '@/features/teams/usecases/GetTeamFixtures.js';

const teamFixturesParams = Type.Object({
  teamId: Type.Integer(),
});

const teamFixturesQuery = Type.Object({
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 50, default: 20 })),
});

export default async function teamsRoutes(fastify: FastifyInstance) {
  const controller = makeTeamsController(fastify);

  fastify.get(
    '/teams/:teamId',
    {
      schema: {
        tags: ['football-teams'],
        params: GetTeamByIdInputSchema,
        response: { 200: GetTeamByIdOutputSchema },
      },
    },
    controller.getTeamById
  );

  fastify.get(
    '/teams/:teamId/fixtures',
    {
      schema: {
        tags: ['football-teams'],
        params: teamFixturesParams,
        querystring: teamFixturesQuery,
        response: { 200: GetTeamFixturesOutputSchema },
      },
    },
    controller.getTeamFixtures
  );
}
