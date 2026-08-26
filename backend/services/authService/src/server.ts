import { app } from './app.js';
import { env } from './config/env.js';
import { initializePostgres, testPostgresConnection } from '@project/postgres';

async function start() {
  // Test connection to Neon PostgreSQL
  initializePostgres(env.databaseUrl);
  await testPostgresConnection();

  app.listen(env.port, () => {
    console.log(`🚀 Auth service running on port ${env.port}`);
  });
}

start();
