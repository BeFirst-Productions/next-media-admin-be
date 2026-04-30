import type { Response } from 'express';

export function sendSuccess<T, M extends object = Record<string, unknown>>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: M,
): void {
  const payload = { success: true as const, message, data, ...(meta && { meta }) };
  res.status(statusCode).json(payload);
}