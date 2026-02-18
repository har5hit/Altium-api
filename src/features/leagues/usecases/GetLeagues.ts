import { Type, type Static } from '@sinclair/typebox';
import { League } from '@/features/leagues/models/league.js';
import type LeaguesRepository from '@/features/leagues/repositories/leaguesRepository.js';
import { getOrSetCached, type ReadCache } from '@/support/cache.js';

export const GetLeaguesInputSchema = Type.Object({
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 200, default: 50 })),
});
export type GetLeaguesInput = Static<typeof GetLeaguesInputSchema>;

export const GetLeaguesOutputSchema = Type.Array(League);
export type GetLeaguesOutput = Static<typeof GetLeaguesOutputSchema>;

export default class GetLeagues {
  constructor(
    private readonly repository: LeaguesRepository,
    private readonly cache: ReadCache | null
  ) {}

  async invoke(input: GetLeaguesInput): Promise<GetLeaguesOutput> {
    const limit = input.limit ?? 50;
    return getOrSetCached(this.cache, `football:leagues:${limit}`, 300, () =>
      this.repository.listLeagues(limit)
    );
  }
}
