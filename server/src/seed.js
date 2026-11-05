import { connectDB, disconnectDB } from './config/db.js';
import { seedDemoData, DEMO_EMAIL, DEMO_PASSWORD } from './seedDemoData.js';

async function run() {
  await connectDB();
  const { created } = await seedDemoData({ reset: true });
  console.log(
    created
      ? `Demo data created.\nEmail: ${DEMO_EMAIL}\nPassword: ${DEMO_PASSWORD}`
      : 'Demo data already exists.'
  );
  await disconnectDB();
  process.exit(0);
}

run().catch(async (error) => {
  console.error('Seed failed:', error);
  await disconnectDB();
  process.exit(1);
});
