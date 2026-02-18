import type { PostgresDb } from '@fastify/postgres';
import type { UserDbModel, CreateUserDbModel } from '@/features/users/repositories/userDbModel.js';

export default class UserRepository {
  constructor(private readonly postgresDb: PostgresDb) {}

  async findAll({ limit, offset }: { limit: number; offset: number }): Promise<UserDbModel[]> {
    const { rows } = await this.postgresDb.query<UserDbModel>(
      `SELECT id, email, name, created_at AS "createdAt"
       FROM users
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows;
  }

  async findById(id: number): Promise<UserDbModel | null> {
    const { rows } = await this.postgresDb.query<UserDbModel>(
      `SELECT id, email, name, created_at AS "createdAt"
       FROM users
       WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async create({ email, name }: CreateUserDbModel): Promise<UserDbModel> {
    const { rows } = await this.postgresDb.query<UserDbModel>(
      `INSERT INTO users (email, name)
       VALUES ($1, $2)
       RETURNING id, email, name, created_at AS "createdAt"`,
      [email, name]
    );
    return rows[0];
  }

  async deleteById(id: number): Promise<boolean> {
    const { rowCount } = await this.postgresDb.query('DELETE FROM users WHERE id = $1', [id]);
    return (rowCount ?? 0) > 0;
  }
}
