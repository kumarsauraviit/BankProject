import type { PoolClient } from 'pg';
import { getPostgresPool } from '../connection.js';
import { type User, type CreateUserDTO, UserStatus } from '../models/user.model.js';

export class UserRepository {
  async create(data: CreateUserDTO): Promise<User> {
    const query = `
      INSERT INTO users (name, email, password_hash, status)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, password_hash, status, created_at, updated_at;
    `;
    const values = [
      data.name,
      data.email.toLowerCase().trim(),
      data.password_hash,
      data.status || UserStatus.ACTIVE,
    ];
    const result = await getPostgresPool().query<User>(query, values);
    const user = result.rows[0];
    if (!user) {
      throw new Error('Failed to create user record');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, name, email, password_hash, status, created_at, updated_at
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1;
    `;
    const result = await getPostgresPool().query<User>(query, [email.trim()]);
    return result.rows[0] || null;
  }

  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, name, email, password_hash, status, created_at, updated_at
      FROM users
      WHERE id = $1
      LIMIT 1;
    `;
    const result = await getPostgresPool().query<User>(query, [id]);
    return result.rows[0] || null;
  }

  async updatePassword(userId: string, passwordHash: string, client?: PoolClient): Promise<boolean> {
    const query = `
      UPDATE users
      SET password_hash = $1, updated_at = (NOW() AT TIME ZONE 'UTC')
      WHERE id = $2;
    `;
    const db = client || getPostgresPool();
    const result = await db.query(query, [passwordHash, userId]);
    return (result.rowCount ?? 0) > 0;
  }
}

export const userRepository = new UserRepository();
