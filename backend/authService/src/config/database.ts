import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

// PostgreSQL connection pool for Neon
export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: {
    rejectUnauthorized: false, // Required for Neon PostgreSQL
  },
});

/**
 * Health check on server startup
 * Never logs sensitive credentials
 */
export async function testDbConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Database connected successfully to Neon PostgreSQL.');
    return true;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Database connection failed:', msg);
    return false;
  }
}
