import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { GetStandingsInput } from '@/features/standings/usecases/GetStandings.js';

export function makeStandingsController(fastify: FastifyInstance) {
  return {
    getStandings(
      request: FastifyRequest<{
        Params: Pick<GetStandingsInput, 'leagueId'>;
        Querystring: Pick<GetStandingsInput, 'season'>;
      }>,
      _reply: FastifyReply
    ) {
      return fastify.di.usecases.getStandings().invoke({
        leagueId: request.params.leagueId,
        season: request.query.season,
      });
    },
  };
}
