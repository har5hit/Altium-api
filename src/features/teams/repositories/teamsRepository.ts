import type { PostgresDb } from '@fastify/postgres';
import type { MatchDbModel } from '@/features/matches/repositories/matchDbModel.js';
import type { TeamDbModel } from '@/features/teams/repositories/teamDbModel.js';

export default class TeamsRepository {
  constructor(private readonly pg: PostgresDb) {}

  async getTeamById(teamId: number): Promise<TeamDbModel | null> {
    const { rows } = await this.pg.query<TeamDbModel>(
      `SELECT id, name, short_name AS "shortName", country, logo_url AS "logoUrl", founded, stadium
       FROM teams
       WHERE id = $1`,
      [teamId]
    );
    return rows[0] ?? null;
  }

  async getTeamFixtures(teamId: number, limit: number): Promise<MatchDbModel[]> {
    const { rows } = await this.pg.query<MatchDbModel>(
      `SELECT id,
              league_id AS "leagueId",
              utc_kickoff AS "utcKickoff",
              status,
              minute,
              home_team_id AS "homeTeamId",
              home_team_name AS "homeTeamName",
              away_team_id AS "awayTeamId",
              away_team_name AS "awayTeamName",
              home_score AS "homeScore",
              away_score AS "awayScore",
              venue
       FROM matches
       WHERE home_team_id = $1 OR away_team_id = $1
       ORDER BY utc_kickoff DESC, id DESC
       LIMIT $2`,
      [teamId, limit]
    );
    return rows;
  }
}
