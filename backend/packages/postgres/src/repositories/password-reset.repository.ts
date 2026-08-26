import type { PoolClient } from 'pg';
import { getPostgresPool } from '../connection.js';
import type { PasswordResetToken, CreatePasswordResetTokenDTO } from '../models/password-reset.model.js';

export class PasswordResetRepository {
  async create(data: CreatePasswordResetTokenDTO, client?: PoolClient): Promise<PasswordResetToken> {
    const query = `
      INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, token_hash, expires_at, used_at, created_at;
    `;
    const values = [data.user_id, data.token_hash, data.expires_at];
    const db = client || getPostgresPool();
    const result = await db.query<PasswordResetToken>(query, values);
    const token = result.rows[0];
    if (!token) {
      throw new Error('Failed to create password reset token record');
    }
    return token;
  }

  async findByTokenHash(tokenHash: string, client?: PoolClient): Promise<PasswordResetToken | null> {
    const query = `
      SELECT id, user_id, token_hash, expires_at, used_at, created_at
      FROM password_reset_tokens
      WHERE token_hash = $1
      LIMIT 1;
    `;
    const db = client || getPostgresPool();
    const result = await db.query<PasswordResetToken>(query, [tokenHash]);
    return result.rows[0] || null;
  }

  async markAsUsed(id: string, client?: PoolClient): Promise<boolean> {
    const query = `
      UPDATE password_reset_tokens
      SET used_at = (NOW() AT TIME ZONE 'UTC')
      WHERE id = $1 AND used_at IS NULL;
    `;
    const db = client || getPostgresPool();
    const result = await db.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

export const passwordResetRepository = new PasswordResetRepository();
