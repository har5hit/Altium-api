import fp from 'fastify-plugin';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';

async function swaggerPlugin(fastify: FastifyInstance) {
  const swaggerHost = fastify.config.HOST === '0.0.0.0' ? 'localhost' : fastify.config.HOST;

  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Altium API',
        description: 'Fastify REST API backend for the Altium iOS app',
        version: '1.0.0',
      },
      servers: [{ url: `http://${swaggerHost}:${fastify.config.PORT}` }],
    },
  });

  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    transformSpecification: (swaggerObject, request) => {
      const host = request.headers.host ?? `localhost:${fastify.config.PORT}`;
      return {
        ...swaggerObject,
        servers: [{ url: `${request.protocol}://${host}` }],
      };
    },
  });
}

export default fp(swaggerPlugin, { name: 'swagger' });
