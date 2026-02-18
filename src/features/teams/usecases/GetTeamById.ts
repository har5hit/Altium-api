import { Type, type Static } from '@sinclair/typebox';
import { NotFoundError } from '@/app/errors.js';
import { Team } from '@/features/teams/models/Team.js';
import type TeamsRepository from '@/features/teams/repositories/TeamsRepository.js';
import { getOrSetCached, type ReadCache } from '@/support/cache.js';

export const GetTeamByIdInputSchema = Type.Object({
  teamId: Type.Integer(),
});
export type GetTeamByIdInput = Static<typeof GetTeamByIdInputSchema>;

export const GetTeamByIdOutputSchema = Team;
export type GetTeamByIdOutput = Static<typeof GetTeamByIdOutputSchema>;

export default class GetTeamById {
  constructor(
    private readonly repository: TeamsRepository,
    private readonly cache: ReadCache | null
  ) {}

  async invoke(input: GetTeamByIdInput): Promise<GetTeamByIdOutput> {
    const key = `football:team:${input.teamId}`;
    const team = await getOrSetCached(this.cache, key, 300, () =>
      this.repository.getTeamById(input.teamId)
    );

    if (!team) throw new NotFoundError('Team not found');
    return team;
  }
}
