import type { PostgresDb } from '@fastify/postgres';
import type { User } from '../types.js';

export default class AuthRepository {
  private pg: PostgresDb;

  constructor(pg: PostgresDb) {
    this.pg = pg;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const { rows } = await this.pg.query<User>('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] || null;
  }
}
