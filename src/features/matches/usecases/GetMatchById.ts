import { Type, type Static } from '@sinclair/typebox';
import { NotFoundError } from '@/app/errors.js';
import { Match } from '@/features/matches/models/match.js';
import type MatchesRepository from '@/features/matches/repositories/matchesRepository.js';
import { getOrSetCached, type ReadCache } from '@/support/cache.js';

export const GetMatchByIdInputSchema = Type.Object({
  matchId: Type.Integer(),
});
export type GetMatchByIdInput = Static<typeof GetMatchByIdInputSchema>;

export const GetMatchByIdOutputSchema = Match;
export type GetMatchByIdOutput = Static<typeof GetMatchByIdOutputSchema>;

export default class GetMatchById {
  constructor(
    private readonly repository: MatchesRepository,
    private readonly cache: ReadCache | null
  ) {}

  async invoke(input: GetMatchByIdInput): Promise<GetMatchByIdOutput> {
    const key = `football:match:${input.matchId}`;
    const match = await getOrSetCached(this.cache, key, 5, () =>
      this.repository.getMatchById(input.matchId)
    );

    if (!match) throw new NotFoundError('Match not found');
    return match;
  }
}
