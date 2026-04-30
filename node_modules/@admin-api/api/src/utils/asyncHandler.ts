import type { Request, Response, NextFunction, RequestHandler } from 'express';

// Wraps async route handlers — no try/catch boilerplate in controllers
type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export function asyncHandler(fn: AsyncRouteHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}