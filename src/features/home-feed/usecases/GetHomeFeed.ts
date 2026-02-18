import { Type, type Static } from '@sinclair/typebox';
import { Match } from '@/features/matches/models/match.js';
import type HomeFeedRepository from '@/features/home-feed/repositories/homeFeedRepository.js';
import { getOrSetCached, type ReadCache } from '@/support/cache.js';

export const GetHomeFeedInputSchema = Type.Object({
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 40 })),
});
export type GetHomeFeedInput = Static<typeof GetHomeFeedInputSchema>;

export const GetHomeFeedOutputSchema = Type.Array(Match);
export type GetHomeFeedOutput = Static<typeof GetHomeFeedOutputSchema>;

export default class GetHomeFeed {
  constructor(
    private readonly repository: HomeFeedRepository,
    private readonly cache: ReadCache | null
  ) {}

  async invoke(input: GetHomeFeedInput): Promise<GetHomeFeedOutput> {
    const limit = input.limit ?? 40;
    return getOrSetCached(this.cache, `football:home:${limit}`, 10, () =>
      this.repository.getHomeFeed(limit)
    );
  }
}
