import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { GetHomeFeedInput } from '@/features/home-feed/usecases/GetHomeFeed.js';

export function makeHomeFeedController(fastify: FastifyInstance) {
  return {
    getHomeFeed(request: FastifyRequest<{ Querystring: GetHomeFeedInput }>, _reply: FastifyReply) {
      return fastify.di.usecases.getHomeFeed().invoke(request.query);
    },
  };
}
