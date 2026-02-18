import type { FastifyInstance } from 'fastify';
import { makeHomeFeedController } from '@/features/home-feed/controllers/homeFeedController.js';
import { GetHomeFeedInputSchema, GetHomeFeedOutputSchema } from '@/features/home-feed/usecases/GetHomeFeed.js';

export default async function homeFeedRoutes(fastify: FastifyInstance) {
  const controller = makeHomeFeedController(fastify);

  fastify.get(
    '/',
    {
      schema: {
        tags: ['football-home-feed'],
        querystring: GetHomeFeedInputSchema,
        response: { 200: GetHomeFeedOutputSchema },
      },
    },
    controller.getHomeFeed
  );
}
