import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

// General API limiter
export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});

// Strict limiter for auth endpoints — prevents brute-force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, try again in 15 minutes' },
});