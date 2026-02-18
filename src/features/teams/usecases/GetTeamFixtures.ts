import { Type, type Static } from '@sinclair/typebox';
import { TeamFixture } from '@/features/teams/models/teamFixture.js';
import type TeamsRepository from '@/features/teams/repositories/teamsRepository.js';
import { getOrSetCached, type ReadCache } from '@/support/cache.js';

export const GetTeamFixturesInputSchema = Type.Object({
  teamId: Type.Integer(),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 50, default: 20 })),
});
export type GetTeamFixturesInput = Static<typeof GetTeamFixturesInputSchema>;

export const GetTeamFixturesOutputSchema = Type.Array(TeamFixture);
export type GetTeamFixturesOutput = Static<typeof GetTeamFixturesOutputSchema>;

export default class GetTeamFixtures {
  constructor(
    private readonly repository: TeamsRepository,
    private readonly cache: ReadCache | null
  ) {}

  async invoke(input: GetTeamFixturesInput): Promise<GetTeamFixturesOutput> {
    const limit = input.limit ?? 20;
    const key = `football:team:${input.teamId}:fixtures:${limit}`;
    return getOrSetCached(this.cache, key, 15, () =>
      this.repository.getTeamFixtures(input.teamId, limit)
    );
  }
}
