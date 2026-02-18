import { Type, type Static } from '@sinclair/typebox';
import { StandingRow } from '@/features/standings/models/standingRow.js';
import type StandingsRepository from '@/features/standings/repositories/standingsRepository.js';
import { getOrSetCached, type ReadCache } from '@/support/cache.js';

export const GetStandingsInputSchema = Type.Object({
  leagueId: Type.Integer(),
  season: Type.String({ minLength: 4, maxLength: 16 }),
});
export type GetStandingsInput = Static<typeof GetStandingsInputSchema>;

export const GetStandingsOutputSchema = Type.Array(StandingRow);
export type GetStandingsOutput = Static<typeof GetStandingsOutputSchema>;

export default class GetStandings {
  constructor(
    private readonly repository: StandingsRepository,
    private readonly cache: ReadCache | null
  ) {}

  async invoke(input: GetStandingsInput): Promise<GetStandingsOutput> {
    const key = `football:standings:${input.leagueId}:${input.season}`;
    return getOrSetCached(this.cache, key, 60, () =>
      this.repository.getStandings(input.leagueId, input.season)
    );
  }
}
