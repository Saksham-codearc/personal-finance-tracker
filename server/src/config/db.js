import mongoose from 'mongoose';
import { env } from './env.js';

let memoryServer = null;

/**
 * Connects to MongoDB. In local development, if no MONGO_URI is supplied,
 * an in-memory MongoDB instance is started so the project is runnable
 * immediately. Production always requires a real MongoDB connection.
 */
export async function connectDB() {
  let uri = env.mongoUri;

  if (!uri) {
    if (env.isProduction) {
      throw new Error('MONGO_URI is required in production.');
    }

    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
    console.log('No MONGO_URI found — started an in-memory MongoDB for local development.');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  return { isMemory: Boolean(memoryServer) };
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
