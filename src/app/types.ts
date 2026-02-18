import type { FastifyRequest } from 'fastify';
import type { EnvConfig } from '@/app/config/env.js';
import type { AppDi } from '@/app/di.js';

export interface PaginationQuery {
  page: number;
  limit: number;
}

declare module 'fastify' {
  interface FastifyInstance {
    config: EnvConfig;
    verifyApiKey: (request: FastifyRequest) => Promise<void>;
    di: AppDi;
  }
}
