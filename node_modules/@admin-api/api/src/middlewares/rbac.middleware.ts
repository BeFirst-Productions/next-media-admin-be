import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ApiError } from '../utils/ApiError';
import type { UserRole } from '@shared/constants/roles';

export function authorize(...allowedRoles: UserRole[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }
    next();
  };
}