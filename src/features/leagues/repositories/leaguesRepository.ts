import type { PostgresDb } from '@fastify/postgres';
import type { LeagueDbModel } from '@/features/leagues/repositories/LeagueDbModel.js';

export default class LeaguesRepository {
  constructor(private readonly pg: PostgresDb) {}

  async listLeagues(limit: number): Promise<LeagueDbModel[]> {
    const { rows } = await this.pg.query<LeagueDbModel>(
      `SELECT id, slug, name, country, priority, logo_url AS "logoUrl"
       FROM leagues
       WHERE is_active = true
       ORDER BY priority ASC, id ASC
       LIMIT $1`,
      [limit]
    );
    return rows;
  }
}
