import type { FastifyInstance } from 'fastify';
import { makeUserController } from './controller.js';
import { getUsersSchema, getUserSchema, createUserSchema, deleteUserSchema } from './schema.js';

export default async function userRoutes(fastify: FastifyInstance) {
  const controller = makeUserController(fastify);

  fastify.get('/', { schema: getUsersSchema }, controller.getUsers);
  fastify.get('/:id', { schema: getUserSchema }, controller.getUser);
  fastify.post('/', { schema: createUserSchema }, controller.createUser);
  fastify.delete('/:id', { schema: deleteUserSchema }, controller.deleteUser);
}
