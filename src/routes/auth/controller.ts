import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import AuthService from '../../services/authService.js';
import AuthRepository from '../../repositories/authRepository.js';

export function makeAuthController(fastify: FastifyInstance) {
  const repo = new AuthRepository(fastify.pg);
  const service = new AuthService(repo);

  return {
    async lookup(request: FastifyRequest<{ Body: { email: string } }>, _reply: FastifyReply) {
      return service.lookupByEmail(request.body.email);
    },
  };
}
