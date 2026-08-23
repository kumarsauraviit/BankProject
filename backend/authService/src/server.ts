import { app } from './app.js';
import { env } from './config/env.js';
import { testDbConnection } from './config/database.js';

async function start() {
  // Test connection to Neon PostgreSQL
  await testDbConnection();

  app.listen(env.port, () => {
    console.log(`🚀 Auth service running on port ${env.port}`);
  });
}

start();
