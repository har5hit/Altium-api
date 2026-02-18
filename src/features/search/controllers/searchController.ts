import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { SearchFootballInput } from '@/features/search/usecases/SearchFootball.js';

export function makeSearchController(fastify: FastifyInstance) {
  return {
    search(request: FastifyRequest<{ Querystring: SearchFootballInput }>, _reply: FastifyReply) {
      return fastify.di.usecases.searchFootball().invoke(request.query);
    },
  };
}
