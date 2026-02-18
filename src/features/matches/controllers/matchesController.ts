import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { GetLiveMatchesInput } from '@/features/matches/usecases/GetLiveMatches.js';
import type { GetMatchByIdInput } from '@/features/matches/usecases/GetMatchById.js';

export function makeMatchesController(fastify: FastifyInstance) {
  return {
    getLiveMatches(
      request: FastifyRequest<{ Querystring: GetLiveMatchesInput }>,
      _reply: FastifyReply
    ) {
      return fastify.di.usecases.getLiveMatches().invoke(request.query);
    },

    getMatchById(request: FastifyRequest<{ Params: GetMatchByIdInput }>, _reply: FastifyReply) {
      return fastify.di.usecases.getMatchById().invoke(request.params);
    },
  };
}
