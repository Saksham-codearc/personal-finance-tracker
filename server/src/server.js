import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';
import { seedDemoData, DEMO_EMAIL, DEMO_PASSWORD } from './seedDemoData.js';

async function start() {
  const { isMemory } = await connectDB();
  env.demoMode = isMemory || env.seedDemo;

  if (env.demoMode) {
    const { created } = await seedDemoData();
    if (created) {
      console.log(`Demo account ready: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
    }
  }

  const server = app.listen(env.port, () => {
    console.log(`Finora API running on http://localhost:${env.port}`);
    if (isMemory) {
      console.log('Using in-memory MongoDB. Data resets when the server stops.');
    }
  });

  async function shutdown(signal) {
    console.log(`\n${signal} received. Closing server...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((error) => {
  console.error('Failed to start Finora API:', error);
  process.exit(1);
});
