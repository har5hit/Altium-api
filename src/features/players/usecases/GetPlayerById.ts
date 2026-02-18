import { Type, type Static } from '@sinclair/typebox';
import { NotFoundError } from '@/app/errors.js';
import { Player } from '@/features/players/models/Player.js';
import type PlayersRepository from '@/features/players/repositories/PlayersRepository.js';
import { getOrSetCached, type ReadCache } from '@/support/cache.js';

export const GetPlayerByIdInputSchema = Type.Object({
  playerId: Type.Integer(),
});
export type GetPlayerByIdInput = Static<typeof GetPlayerByIdInputSchema>;

export const GetPlayerByIdOutputSchema = Player;
export type GetPlayerByIdOutput = Static<typeof GetPlayerByIdOutputSchema>;

export default class GetPlayerById {
  constructor(
    private readonly repository: PlayersRepository,
    private readonly cache: ReadCache | null
  ) {}

  async invoke(input: GetPlayerByIdInput): Promise<GetPlayerByIdOutput> {
    const key = `football:player:${input.playerId}`;
    const player = await getOrSetCached(this.cache, key, 60, () =>
      this.repository.getPlayerById(input.playerId)
    );

    if (!player) throw new NotFoundError('Player not found');
    return player;
  }
}
