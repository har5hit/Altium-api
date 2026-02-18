import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { GetLeaguesInput } from '@/features/leagues/usecases/GetLeagues.js';

export function makeLeaguesController(fastify: FastifyInstance) {
  return {
    getLeagues(
      request: FastifyRequest<{ Querystring: GetLeaguesInput }>,
      _reply: FastifyReply
    ) {
      return fastify.di.usecases.getLeagues().invoke(request.query);
    },
  };
}
