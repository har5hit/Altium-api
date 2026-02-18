import type { PostgresDb } from '@fastify/postgres';
import { MatchStatus } from '@/features/matches/models/MatchStatus.js';
import type { MatchDbModel } from '@/features/matches/repositories/MatchDbModel.js';

export default class HomeFeedRepository {
  constructor(private readonly pg: PostgresDb) {}

  async getHomeFeed(limit: number): Promise<MatchDbModel[]> {
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
       WHERE utc_kickoff >= now() - interval '12 hours'
       ORDER BY
         CASE status
           WHEN '${MatchStatus.LIVE}' THEN 1
           WHEN '${MatchStatus.SCHEDULED}' THEN 2
           WHEN '${MatchStatus.FINISHED}' THEN 3
           ELSE 4
         END,
         utc_kickoff ASC,
         id ASC
       LIMIT $1`,
      [limit]
    );
    return rows;
  }
}
