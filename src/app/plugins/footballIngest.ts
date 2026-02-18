import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import VendorHttpClient from '@/features/ingestion/providers/VendorHttpClient.js';
import VendorWsClient from '@/features/ingestion/providers/VendorWsClient.js';
import FootballIngestRepository from '@/features/ingestion/repositories/FootballIngestRepository.js';
import VendorIngestWorker from '@/features/ingestion/workers/VendorIngestWorker.js';
import LiveEventWorker from '@/features/ingestion/workers/LiveEventWorker.js';

function parseStandingsSeed(input: string): Array<{ leagueId: number; season: string }> {
  if (!input) return [];

  return input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [leagueIdRaw, seasonRaw] = item.split(':');
      return {
        leagueId: Number(leagueIdRaw),
        season: seasonRaw,
      };
    })
    .filter((item) => Number.isInteger(item.leagueId) && item.leagueId > 0 && item.season);
}

async function footballIngestPlugin(fastify: FastifyInstance) {
  if (!fastify.config.FOOTBALL_INGEST_ENABLED) return;
  if (!fastify.config.DATABASE_URL) return;
  if (!fastify.config.FOOTBALL_VENDOR_HTTP_URL) return;

  const repository = new FootballIngestRepository(fastify.pg);
  const httpClient = new VendorHttpClient(
    fastify.config.FOOTBALL_VENDOR_HTTP_URL,
    fastify.config.FOOTBALL_VENDOR_API_KEY
  );

  const ingestWorker = new VendorIngestWorker(
    httpClient,
    repository,
    fastify.config.FOOTBALL_INGEST_INTERVAL_MS,
    parseStandingsSeed(fastify.config.FOOTBALL_STANDINGS_SEED)
  );

  let liveWorker: LiveEventWorker | null = null;
  if (fastify.config.FOOTBALL_VENDOR_WS_URL) {
    const wsClient = new VendorWsClient(
      fastify.config.FOOTBALL_VENDOR_WS_URL,
      fastify.config.FOOTBALL_VENDOR_API_KEY
    );
    liveWorker = new LiveEventWorker(wsClient, repository);
  }

  fastify.addHook('onReady', async () => {
    ingestWorker.start();
    liveWorker?.start();
  });

  fastify.addHook('onClose', async () => {
    ingestWorker.stop();
    liveWorker?.stop();
  });
}

export default fp(footballIngestPlugin, { name: 'football-ingest' });
