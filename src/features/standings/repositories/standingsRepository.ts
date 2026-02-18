import type { PostgresDb } from '@fastify/postgres';
import type { StandingRowDbModel } from '@/features/standings/repositories/standingRowDbModel.js';

export default class StandingsRepository {
  constructor(private readonly pg: PostgresDb) {}

  async getStandings(competitionId: number, season: string): Promise<StandingRowDbModel[]> {
    const { rows } = await this.pg.query<StandingRowDbModel>(
      `SELECT position,
              team_id AS "teamId",
              team_name AS "teamName",
              played,
              won,
              draw,
              lost,
              goals_for AS "goalsFor",
              goals_against AS "goalsAgainst",
              goal_difference AS "goalDifference",
              points,
              form
       FROM standings_snapshots
       WHERE competition_id = $1 AND season = $2
       ORDER BY position ASC`,
      [competitionId, season]
    );
    return rows;
  }
}
