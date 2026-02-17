import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import UserService from '../../services/userService.js';
import UserRepository from '../../repositories/userRepository.js';
import type { PaginationQuery, CreateUserInput } from '../../types.js';

export function makeUserController(fastify: FastifyInstance) {
  const repo = new UserRepository(fastify.pg);
  const service = new UserService(repo);

  return {
    async getUsers(request: FastifyRequest<{ Querystring: PaginationQuery }>, _reply: FastifyReply) {
      const { page, limit } = request.query;
      return service.getUsers({ page, limit });
    },

    async getUser(request: FastifyRequest<{ Params: { id: number } }>, _reply: FastifyReply) {
      return service.getUserById(request.params.id);
    },

    async createUser(request: FastifyRequest<{ Body: CreateUserInput }>, reply: FastifyReply) {
      const user = await service.createUser(request.body);
      reply.code(201);
      return user;
    },

    async deleteUser(request: FastifyRequest<{ Params: { id: number } }>, _reply: FastifyReply) {
      await service.deleteUser(request.params.id);
      return { message: 'User deleted' };
    },
  };
}
