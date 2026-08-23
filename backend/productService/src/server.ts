import { app } from './app.js';
import { testDbConnection } from './config/database.js';
import { env } from './config/env.js';

async function start() {
  await testDbConnection();

  app.listen(env.port, () => {
    console.log(`Product service running on port ${env.port}`);
  });
}

start();
