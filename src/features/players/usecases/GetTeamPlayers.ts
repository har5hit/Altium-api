import { Type, type Static } from '@sinclair/typebox';
import { Player } from '@/features/players/models/Player.js';
import type PlayersRepository from '@/features/players/repositories/PlayersRepository.js';
import { getOrSetCached, type ReadCache } from '@/support/cache.js';

export const GetTeamPlayersInputSchema = Type.Object({
  teamId: Type.Integer(),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 40 })),
});
export type GetTeamPlayersInput = Static<typeof GetTeamPlayersInputSchema>;

export const GetTeamPlayersOutputSchema = Type.Array(Player);
export type GetTeamPlayersOutput = Static<typeof GetTeamPlayersOutputSchema>;

export default class GetTeamPlayers {
  constructor(
    private readonly repository: PlayersRepository,
    private readonly cache: ReadCache | null
  ) {}

  async invoke(input: GetTeamPlayersInput): Promise<GetTeamPlayersOutput> {
    const limit = input.limit ?? 40;
    const key = `football:team:${input.teamId}:players:${limit}`;
    return getOrSetCached(this.cache, key, 60, () => this.repository.getTeamPlayers(input.teamId, limit));
  }
}
