import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { GetPlayerByIdInput } from '@/features/players/usecases/GetPlayerById.js';
import type { GetTeamPlayersInput } from '@/features/players/usecases/GetTeamPlayers.js';

export function makePlayersController(fastify: FastifyInstance) {
  return {
    getPlayerById(request: FastifyRequest<{ Params: GetPlayerByIdInput }>, _reply: FastifyReply) {
      return fastify.di.usecases.getPlayerById().invoke(request.params);
    },

    getTeamPlayers(
      request: FastifyRequest<{
        Params: Pick<GetTeamPlayersInput, 'teamId'>;
        Querystring: Pick<GetTeamPlayersInput, 'limit'>;
      }>,
      _reply: FastifyReply
    ) {
      return fastify.di.usecases.getTeamPlayers().invoke({
        teamId: request.params.teamId,
        limit: request.query.limit,
      });
    },
  };
}
