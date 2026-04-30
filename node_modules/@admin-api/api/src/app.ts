import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { apiLimiter } from './middlewares/rateLimiter.middleware';
import { globalErrorHandler } from './middlewares/errorHandler.middleware';
import { requestLogger } from './middlewares/requestLogger.middleware';
import router from './routes/index';
import { env } from './config/env';

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.set('trust proxy', 1);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || env.ALLOWED_ORIGINS.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    }),
  );

  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser());
  app.use(requestLogger);
  app.use(apiLimiter);

  app.use('/api/v1', router);

  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });

  app.use(globalErrorHandler);

  return app;
}