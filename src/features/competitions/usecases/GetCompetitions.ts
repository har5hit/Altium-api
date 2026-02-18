import { Type, type Static } from '@sinclair/typebox';
import { League } from '@/features/competitions/models/competition.js';
import type CompetitionsRepository from '@/features/competitions/repositories/competitionsRepository.js';
import { getOrSetCached, type ReadCache } from '@/support/cache.js';

export const GetCompetitionsInputSchema = Type.Object({
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 200, default: 50 })),
});
export type GetCompetitionsInput = Static<typeof GetCompetitionsInputSchema>;

export const GetCompetitionsOutputSchema = Type.Array(League);
export type GetCompetitionsOutput = Static<typeof GetCompetitionsOutputSchema>;

export default class GetCompetitions {
  constructor(
    private readonly repository: CompetitionsRepository,
    private readonly cache: ReadCache | null
  ) {}

  async invoke(input: GetCompetitionsInput): Promise<GetCompetitionsOutput> {
    const limit = input.limit ?? 50;
    return getOrSetCached(this.cache, `football:competitions:${limit}`, 300, () =>
      this.repository.listCompetitions(limit)
    );
  }
}
