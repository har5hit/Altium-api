import { Type, type Static } from '@sinclair/typebox';
import { Match } from '@/features/matches/models/Match.js';
import type MatchesRepository from '@/features/matches/repositories/MatchesRepository.js';
import { getOrSetCached, type ReadCache } from '@/support/cache.js';

export const GetLiveMatchesInputSchema = Type.Object({
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 30 })),
});
export type GetLiveMatchesInput = Static<typeof GetLiveMatchesInputSchema>;

export const GetLiveMatchesOutputSchema = Type.Array(Match);
export type GetLiveMatchesOutput = Static<typeof GetLiveMatchesOutputSchema>;

export default class GetLiveMatches {
  constructor(
    private readonly repository: MatchesRepository,
    private readonly cache: ReadCache | null
  ) {}

  async invoke(input: GetLiveMatchesInput): Promise<GetLiveMatchesOutput> {
    const limit = input.limit ?? 30;
    return getOrSetCached(this.cache, `football:matches:live:${limit}`, 5, () =>
      this.repository.getLiveMatches(limit)
    );
  }
}
