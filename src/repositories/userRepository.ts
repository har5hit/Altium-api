import type { PostgresDb } from '@fastify/postgres';
import type { User, CreateUserInput } from '../types.js';

export default class UserRepository {
  private pg: PostgresDb;

  constructor(pg: PostgresDb) {
    this.pg = pg;
  }

  async findAll({ limit, offset }: { limit: number; offset: number }): Promise<User[]> {
    const { rows } = await this.pg.query<User>(
      'SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return rows;
  }

  async findById(id: number): Promise<User | null> {
    const { rows } = await this.pg.query<User>('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] || null;
  }

  async create({ email, name }: CreateUserInput): Promise<User> {
    const { rows } = await this.pg.query<User>(
      'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
      [email, name]
    );
    return rows[0];
  }

  async deleteById(id: number): Promise<boolean> {
    const { rowCount } = await this.pg.query('DELETE FROM users WHERE id = $1', [id]);
    return (rowCount ?? 0) > 0;
  }
}
