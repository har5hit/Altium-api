import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { GetCompetitionsInput } from '@/features/competitions/usecases/GetCompetitions.js';

export function makeCompetitionsController(fastify: FastifyInstance) {
  return {
    getCompetitions(
      request: FastifyRequest<{ Querystring: GetCompetitionsInput }>,
      _reply: FastifyReply
    ) {
      return fastify.di.usecases.getCompetitions().invoke(request.query);
    },
  };
}
