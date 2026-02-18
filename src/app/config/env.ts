export interface EnvConfig {
  HOST: string;
  PORT: number;
  DATABASE_URL: string;
  REDIS_URL: string;
  API_KEY: string;
  FOOTBALL_VENDOR_HTTP_URL: string;
  FOOTBALL_VENDOR_WS_URL: string;
  FOOTBALL_VENDOR_API_KEY: string;
  FOOTBALL_INGEST_ENABLED: boolean;
  FOOTBALL_INGEST_INTERVAL_MS: number;
  FOOTBALL_STANDINGS_SEED: string;
}

const schema = {
  type: 'object' as const,
  properties: {
    HOST: { type: 'string' as const, default: '0.0.0.0' },
    PORT: { type: 'integer' as const, default: 3000 },
    DATABASE_URL: { type: 'string' as const, default: '' },
    REDIS_URL: { type: 'string' as const, default: '' },
    API_KEY: { type: 'string' as const, default: '' },
    FOOTBALL_VENDOR_HTTP_URL: { type: 'string' as const, default: '' },
    FOOTBALL_VENDOR_WS_URL: { type: 'string' as const, default: '' },
    FOOTBALL_VENDOR_API_KEY: { type: 'string' as const, default: '' },
    FOOTBALL_INGEST_ENABLED: { type: 'boolean' as const, default: false },
    FOOTBALL_INGEST_INTERVAL_MS: { type: 'integer' as const, default: 15000 },
    FOOTBALL_STANDINGS_SEED: { type: 'string' as const, default: '' },
  },
};

export default schema;
