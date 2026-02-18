import type FootballIngestRepository from '@/features/ingestion/repositories/footballIngestRepository.js';
import type VendorHttpClient from '@/features/ingestion/providers/vendorHttpClient.js';

export default class VendorIngestWorker {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly client: VendorHttpClient,
    private readonly repository: FootballIngestRepository,
    private readonly intervalMs: number,
    private readonly standingsSeed: Array<{ leagueId: number; season: string }>
  ) {}

  start(): void {
    if (this.timer) return;

    this.pollOnce().catch(() => undefined);
    this.timer = setInterval(() => {
      this.pollOnce().catch(() => undefined);
    }, this.intervalMs);
  }

  stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  private async pollOnce(): Promise<void> {
    const [leagues, teams, matches] = await Promise.all([
      this.client.getLeagues(),
      this.client.getTeams(),
      this.client.getMatches(),
    ]);

    await this.repository.upsertLeagues(leagues);
    await this.repository.upsertTeams(teams);
    await this.repository.upsertMatches(matches);

    for (const seed of this.standingsSeed) {
      const rows = await this.client.getStandings(seed.leagueId, seed.season);
      await this.repository.replaceStandings(rows);
    }
  }
}
