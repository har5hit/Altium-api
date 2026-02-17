import type { FastifyRequest } from 'fastify';
import type { EnvConfig } from './config/env.js';

export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
}

export interface PaginationQuery {
  page: number;
  limit: number;
}

declare module 'fastify' {
  interface FastifyInstance {
    config: EnvConfig;
    verifyApiKey: (request: FastifyRequest) => Promise<void>;
  }
}
