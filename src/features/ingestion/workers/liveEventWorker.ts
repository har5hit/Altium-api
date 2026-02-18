import type VendorWsClient from '@/features/ingestion/providers/VendorWsClient.js';
import type FootballIngestRepository from '@/features/ingestion/repositories/FootballIngestRepository.js';
import type { VendorMatchDbModel } from '@/features/ingestion/repositories/footballIngestDbModel.js';

export default class LiveEventWorker {
  constructor(
    private readonly wsClient: VendorWsClient,
    private readonly repository: FootballIngestRepository
  ) {}

  start(): void {
    this.wsClient.on('event', async (event: { type: string; payload: unknown }) => {
      if (event.type !== 'match_update') return;
      await this.repository.upsertMatches([event.payload as VendorMatchDbModel]);
    });

    this.wsClient.connect();
  }

  stop(): void {
    this.wsClient.close();
  }
}
