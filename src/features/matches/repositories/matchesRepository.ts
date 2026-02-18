import type { PostgresDb } from '@fastify/postgres';
import { MatchStatus } from '@/features/matches/models/matchStatus.js';
import type { MatchDbModel } from '@/features/matches/repositories/matchDbModel.js';

export default class MatchesRepository {
  constructor(private readonly pg: PostgresDb) {}

  async getLiveMatches(limit: number): Promise<MatchDbModel[]> {
    const { rows } = await this.pg.query<MatchDbModel>(
      `SELECT id,
              competition_id AS "competitionId",
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
       WHERE status = $2
       ORDER BY utc_kickoff ASC, id ASC
       LIMIT $1`,
      [limit, MatchStatus.Live]
    );
    return rows;
  }

  async getMatchById(matchId: number): Promise<MatchDbModel | null> {
    const { rows } = await this.pg.query<MatchDbModel>(
      `SELECT id,
              competition_id AS "competitionId",
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
       WHERE id = $1`,
      [matchId]
    );
    return rows[0] ?? null;
  }
}
