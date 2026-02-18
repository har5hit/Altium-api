import type { PostgresDb } from '@fastify/postgres';
import type { CompetitionDbModel } from '@/features/competitions/repositories/competitionDbModel.js';

export default class CompetitionsRepository {
  constructor(private readonly pg: PostgresDb) {}

  async listCompetitions(limit: number): Promise<CompetitionDbModel[]> {
    const { rows } = await this.pg.query<CompetitionDbModel>(
      `SELECT id, slug, name, country, priority, logo_url AS "logoUrl"
       FROM competitions
       WHERE is_active = true
       ORDER BY priority ASC, id ASC
       LIMIT $1`,
      [limit]
    );
    return rows;
  }
}
