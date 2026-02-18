import type { PostgresDb } from '@fastify/postgres';
import type { SearchResultDbModel } from '@/features/search/repositories/searchResultDbModel.js';

export default class SearchRepository {
  constructor(private readonly pg: PostgresDb) {}

  async search(query: string, limit: number): Promise<SearchResultDbModel[]> {
    const normalized = `%${query.toLowerCase()}%`;
    const { rows } = await this.pg.query<SearchResultDbModel>(
      `(
         SELECT 'team'::text as type, id, name as title,
                country as subtitle, short_name as meta
         FROM teams
         WHERE lower(name) LIKE $1
         LIMIT $2
       )
       UNION ALL
       (
         SELECT 'competition'::text as type, id, name as title,
                country as subtitle, slug as meta
         FROM competitions
         WHERE lower(name) LIKE $1
         LIMIT $2
       )
       UNION ALL
       (
         SELECT 'match'::text as type, id,
                home_team_name || ' vs ' || away_team_name as title,
                to_char(utc_kickoff, 'YYYY-MM-DD HH24:MI') as subtitle,
                status::text as meta
         FROM matches
         WHERE lower(home_team_name) LIKE $1 OR lower(away_team_name) LIKE $1
         LIMIT $2
       )
       LIMIT $2`,
      [normalized, limit]
    );
    return rows;
  }
}
