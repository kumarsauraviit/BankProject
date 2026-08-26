import { app } from './app.js';
import { env } from './config/env.js';
import { initializeMongoDb, testMongoDbConnection } from '@project/mongodb';

async function start() {
  await initializeMongoDb(env.mongoDbUri);
  await testMongoDbConnection();

  app.listen(env.port, () => {
    console.log(`Product service running on port ${env.port}`);
  });
}

start();
