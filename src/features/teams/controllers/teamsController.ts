import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { GetTeamByIdInput } from '@/features/teams/usecases/GetTeamById.js';
import type { GetTeamFixturesInput } from '@/features/teams/usecases/GetTeamFixtures.js';

export function makeTeamsController(fastify: FastifyInstance) {
  return {
    getTeamById(request: FastifyRequest<{ Params: GetTeamByIdInput }>, _reply: FastifyReply) {
      return fastify.di.usecases.getTeamById().invoke(request.params);
    },

    getTeamFixtures(
      request: FastifyRequest<{
        Params: Pick<GetTeamFixturesInput, 'teamId'>;
        Querystring: Pick<GetTeamFixturesInput, 'limit'>;
      }>,
      _reply: FastifyReply
    ) {
      return fastify.di.usecases.getTeamFixtures().invoke({
        teamId: request.params.teamId,
        limit: request.query.limit,
      });
    },
  };
}
