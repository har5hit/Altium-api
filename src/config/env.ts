export interface EnvConfig {
  HOST: string;
  PORT: number;
  DATABASE_URL: string;
  REDIS_URL: string;
  API_KEY: string;
}

const schema = {
  type: 'object' as const,
  properties: {
    HOST: { type: 'string' as const, default: '0.0.0.0' },
    PORT: { type: 'integer' as const, default: 3000 },
    DATABASE_URL: { type: 'string' as const, default: '' },
    REDIS_URL: { type: 'string' as const, default: '' },
    API_KEY: { type: 'string' as const, default: '' },
  },
};

export default schema;
