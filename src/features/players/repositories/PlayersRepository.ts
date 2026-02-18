import type { PostgresDb } from '@fastify/postgres';
import type { PlayerDbModel } from '@/features/players/repositories/PlayerDbModel.js';

export default class PlayersRepository {
  constructor(private readonly pg: PostgresDb) {}

  async getPlayerById(playerId: number): Promise<PlayerDbModel | null> {
    const { rows } = await this.pg.query<PlayerDbModel>(
      `SELECT id,
              team_id AS "teamId",
              league_id AS "leagueId",
              name,
              short_name AS "shortName",
              position,
              jersey_number AS "jerseyNumber",
              date_of_birth::text AS "dateOfBirth",
              nationality,
              height_cm AS "heightCm",
              preferred_foot AS "preferredFoot",
              photo_url AS "photoUrl"
       FROM players
       WHERE id = $1`,
      [playerId]
    );
    return rows[0] ?? null;
  }

  async getTeamPlayers(teamId: number, limit: number): Promise<PlayerDbModel[]> {
    const { rows } = await this.pg.query<PlayerDbModel>(
      `SELECT id,
              team_id AS "teamId",
              league_id AS "leagueId",
              name,
              short_name AS "shortName",
              position,
              jersey_number AS "jerseyNumber",
              date_of_birth::text AS "dateOfBirth",
              nationality,
              height_cm AS "heightCm",
              preferred_foot AS "preferredFoot",
              photo_url AS "photoUrl"
       FROM players
       WHERE team_id = $1
       ORDER BY
         CASE WHEN jersey_number IS NULL THEN 1 ELSE 0 END,
         jersey_number ASC,
         id ASC
       LIMIT $2`,
      [teamId, limit]
    );
    return rows;
  }
}
