import type { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';
import { makePlayersController } from '@/features/players/controllers/playersController.js';
import { GetPlayerByIdInputSchema, GetPlayerByIdOutputSchema } from '@/features/players/usecases/GetPlayerById.js';
import { GetTeamPlayersOutputSchema } from '@/features/players/usecases/GetTeamPlayers.js';

const teamPlayersParams = Type.Object({
  teamId: Type.Integer(),
});

const teamPlayersQuery = Type.Object({
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 40 })),
});

export default async function playersRoutes(fastify: FastifyInstance) {
  const controller = makePlayersController(fastify);

  fastify.get(
    '/players/:playerId',
    {
      schema: {
        tags: ['football-players'],
        params: GetPlayerByIdInputSchema,
        response: { 200: GetPlayerByIdOutputSchema },
      },
    },
    controller.getPlayerById
  );

  fastify.get(
    '/teams/:teamId/players',
    {
      schema: {
        tags: ['football-players'],
        params: teamPlayersParams,
        querystring: teamPlayersQuery,
        response: { 200: GetTeamPlayersOutputSchema },
      },
    },
    controller.getTeamPlayers
  );
}
