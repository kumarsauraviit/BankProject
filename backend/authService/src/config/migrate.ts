import { pool } from './database.js';

export async function runMigrations() {
  console.log('🔄 Running database migrations...');

  const query = `
    -- User status enum
    DO $$ BEGIN
      CREATE TYPE user_status AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      status user_status NOT NULL DEFAULT 'ACTIVE',
      created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
    );

    -- Unique case-insensitive index on email
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));

    -- Trigger for updating updated_at in UTC
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = (NOW() AT TIME ZONE 'UTC');
      RETURN NEW;
    END;
    $$ language 'plpgsql';

    DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
    CREATE TRIGGER trg_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

    -- Password Reset Tokens table
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(255) NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ DEFAULT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
    );

    -- Indexes for token lookup and user lookup
    CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON password_reset_tokens (token_hash);
    CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens (user_id);
  `;

  try {
    await pool.query(query);
    console.log('✅ Migrations applied successfully!');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Migration error';
    console.error('❌ Migration failed:', msg);
  } finally {
    await pool.end();
  }
}

runMigrations();
