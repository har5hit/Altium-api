import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import VendorHttpClient from '@/features/ingestion/providers/vendorHttpClient.js';
import VendorWsClient from '@/features/ingestion/providers/vendorWsClient.js';
import FootballIngestRepository from '@/features/ingestion/repositories/footballIngestRepository.js';
import VendorIngestWorker from '@/features/ingestion/workers/vendorIngestWorker.js';
import LiveEventWorker from '@/features/ingestion/workers/liveEventWorker.js';

function parseStandingsSeed(input: string): Array<{ competitionId: number; season: string }> {
  if (!input) return [];

  return input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [competitionIdRaw, seasonRaw] = item.split(':');
      return {
        competitionId: Number(competitionIdRaw),
        season: seasonRaw,
      };
    })
    .filter((item) => Number.isInteger(item.competitionId) && item.competitionId > 0 && item.season);
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
