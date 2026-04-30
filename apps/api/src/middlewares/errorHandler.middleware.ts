import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { MongoServerError } from 'mongodb';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export function globalErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.issues.map((e) => ({ path: e.path.join('.'), message: e.message })),
    });
    return;
  }

  // JWT errors
  if (err instanceof TokenExpiredError) {
    res.status(401).json({ success: false, message: 'Token expired' });
    return;
  }
  if (err instanceof JsonWebTokenError) {
    res.status(401).json({ success: false, message: 'Invalid token' });
    return;
  }

  // Mongoose duplicate key
  if (err instanceof MongoServerError && err.code === 11000) {
    const field = Object.keys(err.keyPattern ?? {})[0] ?? 'field';
    res.status(409).json({ success: false, message: `${field} already exists` });
    return;
  }

  // Operational API errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  // Unknown/programming errors — log fully, hide details in prod
  logger.error('Unhandled error', { err, url: req.url, method: req.method });
  res.status(500).json({
    success: false,
    message: env.NODE_ENV === 'production' ? 'Internal server error' : String(err),
  });
}