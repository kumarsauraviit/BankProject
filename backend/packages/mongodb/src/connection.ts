import mongoose from 'mongoose';

let initializedUri: string | undefined;

export async function initializeMongoDb(mongoDbUri: string): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1 || initializedUri === mongoDbUri) {
    return mongoose;
  }

  await mongoose.connect(mongoDbUri);
  initializedUri = mongoDbUri;
  return mongoose;
}

/**
 * Health check on server startup.
 * Never logs the MongoDB connection string or credentials.
 */
export async function testMongoDbConnection(): Promise<boolean> {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB has not been initialized. Call initializeMongoDb first.');
    }
    console.log('Database connected successfully to MongoDB.');
    return true;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Database connection failed:', msg);
    return false;
  }
}



