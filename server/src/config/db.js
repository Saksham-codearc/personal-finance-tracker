import mongoose from 'mongoose';
import { env } from './env.js';

let memoryServer = null;


export async function connectDB() {
  let uri = env.mongoUri;

if (!uri) {
  const { MongoMemoryServer } = await import('mongodb-memory-server');

  memoryServer = await MongoMemoryServer.create();
  uri = memoryServer.getUri();

  console.log('Using in-memory MongoDB.');
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
