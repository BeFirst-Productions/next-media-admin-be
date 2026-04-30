import { createApp } from './app';
import { connectDatabase } from './database/connection';
import { env } from './config/env';
import { logger } from './utils/logger';
import { seedSuperAdmin } from './utils/seed';

async function bootstrap(): Promise<void> {
  await connectDatabase();
  await seedSuperAdmin(); // idempotent — only runs once

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      const { disconnectDatabase } = await import('./database/connection');
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Fatal startup error', err);
  process.exit(1);
});