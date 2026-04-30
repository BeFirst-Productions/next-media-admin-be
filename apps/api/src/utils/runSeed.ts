/**
 * Standalone seed script — run with: npm run seed
 * Seeds the superadmin user if one doesn't already exist.
 */
import { connectDatabase, disconnectDatabase } from '../database/connection';
import { seedSuperAdmin } from './seed';
import { logger } from './logger';

async function run(): Promise<void> {
  try {
    await connectDatabase();
    await seedSuperAdmin();
    logger.info('Seed completed successfully');
  } catch (err) {
    logger.error('Seed failed', { err });
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

run();
