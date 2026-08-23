import mongoose from 'mongoose';
import { env } from './env.js';

/**
 * Health check on server startup.
 * Never logs the MongoDB connection string or credentials.
 */
export async function testDbConnection(): Promise<boolean> {
  try {
    await mongoose.connect(env.mongoDbUri);
    console.log('Database connected successfully to MongoDB.');
    return true;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Database connection failed:', msg);
    return false;
  }
}
