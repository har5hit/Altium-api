import type { PostgresDb } from '@fastify/postgres';
import type {
  VendorCompetitionDbModel,
  VendorMatchDbModel,
  VendorStandingsRowDbModel,
  VendorTeamDbModel,
} from '@/features/ingestion/repositories/footballIngestDbModel.js';

export default class FootballIngestRepository {
  constructor(private readonly postgresDb: PostgresDb) {}

  async upsertCompetitions(items: VendorCompetitionDbModel[]): Promise<void> {
    for (const item of items) {
      await this.postgresDb.query(
        `INSERT INTO competitions (id, slug, name, country, priority, logo_url, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true)
         ON CONFLICT (id) DO UPDATE SET
           slug = EXCLUDED.slug,
           name = EXCLUDED.name,
           country = EXCLUDED.country,
           priority = EXCLUDED.priority,
           logo_url = EXCLUDED.logo_url,
           is_active = true`,
        [item.id, item.slug, item.name, item.country, item.priority, item.logoUrl]
      );
    }
  }

  async upsertTeams(items: VendorTeamDbModel[]): Promise<void> {
    for (const item of items) {
      await this.postgresDb.query(
        `INSERT INTO teams (id, name, short_name, country, logo_url, founded, stadium)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           short_name = EXCLUDED.short_name,
           country = EXCLUDED.country,
           logo_url = EXCLUDED.logo_url,
           founded = EXCLUDED.founded,
           stadium = EXCLUDED.stadium`,
        [item.id, item.name, item.shortName, item.country, item.logoUrl, item.founded, item.stadium]
      );
    }
  }

  async upsertMatches(items: VendorMatchDbModel[]): Promise<void> {
    for (const item of items) {
      await this.postgresDb.query(
        `INSERT INTO matches (
          id, competition_id, utc_kickoff, status, minute,
          home_team_id, home_team_name, away_team_id, away_team_name,
          home_score, away_score, venue
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          competition_id = EXCLUDED.competition_id,
          utc_kickoff = EXCLUDED.utc_kickoff,
          status = EXCLUDED.status,
          minute = EXCLUDED.minute,
          home_team_id = EXCLUDED.home_team_id,
          home_team_name = EXCLUDED.home_team_name,
          away_team_id = EXCLUDED.away_team_id,
          away_team_name = EXCLUDED.away_team_name,
          home_score = EXCLUDED.home_score,
          away_score = EXCLUDED.away_score,
          venue = EXCLUDED.venue`,
        [
          item.id,
          item.competitionId,
          item.utcKickoff,
          item.status,
          item.minute,
          item.homeTeamId,
          item.homeTeamName,
          item.awayTeamId,
          item.awayTeamName,
          item.homeScore,
          item.awayScore,
          item.venue,
        ]
      );
    }
  }

  async replaceStandings(rows: VendorStandingsRowDbModel[]): Promise<void> {
    if (rows.length === 0) return;

    const { competitionId, season } = rows[0];
    await this.postgresDb.query('DELETE FROM standings_snapshots WHERE competition_id = $1 AND season = $2', [
      competitionId,
      season,
    ]);

    for (const row of rows) {
      await this.postgresDb.query(
        `INSERT INTO standings_snapshots (
          competition_id, season, position, team_id, team_name,
          played, won, draw, lost, goals_for, goals_against, goal_difference, points, form
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          row.competitionId,
          row.season,
          row.position,
          row.teamId,
          row.teamName,
          row.played,
          row.won,
          row.draw,
          row.lost,
          row.goalsFor,
          row.goalsAgainst,
          row.goalDifference,
          row.points,
          row.form,
        ]
      );
    }
  }
}
