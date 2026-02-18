import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { CreateUserInput } from '@/features/users/usecases/CreateUser.js';
import type { GetUsersInput } from '@/features/users/usecases/GetUsers.js';
import type { GetUserByIdInput } from '@/features/users/usecases/GetUserById.js';
import type { DeleteUserInput } from '@/features/users/usecases/DeleteUser.js';

export function makeUserController(fastify: FastifyInstance) {
  return {
    async getUsers(request: FastifyRequest<{ Querystring: GetUsersInput }>, _reply: FastifyReply) {
      return fastify.di.usecases.getUsers().invoke(request.query);
    },

    async getUser(request: FastifyRequest<{ Params: GetUserByIdInput }>, _reply: FastifyReply) {
      return fastify.di.usecases.getUserById().invoke(request.params);
    },

    async createUser(request: FastifyRequest<{ Body: CreateUserInput }>, reply: FastifyReply) {
      const user = await fastify.di.usecases.createUser().invoke(request.body);
      reply.code(201);
      return user;
    },

    async deleteUser(request: FastifyRequest<{ Params: DeleteUserInput }>, _reply: FastifyReply) {
      return fastify.di.usecases.deleteUser().invoke(request.params);
    },
  };
}
