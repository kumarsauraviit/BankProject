import pg from 'pg';

const { Pool } = pg;
let pool: pg.Pool | undefined;

/** Initializes the single shared PostgreSQL connection pool. */
export function initializePostgres(databaseUrl: string): pg.Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

export function getPostgresPool(): pg.Pool {
  if (!pool) {
    throw new Error('PostgreSQL has not been initialized. Call initializePostgres first.');
  }
  return pool;
}

/**
 * Health check on server startup
 * Never logs sensitive credentials
 */
export async function testPostgresConnection(): Promise<boolean> {
  try {
    await getPostgresPool().query('SELECT 1');
    console.log('✅ Database connected successfully to Neon PostgreSQL.');
    return true;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Database connection failed:', msg);
    return false;
  }
}

export async function closePostgresConnection(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
