import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../config/jwt';
import { ApiError } from '../utils/ApiError';
import { User } from '../modules/user/user.schema';

// Augment Express Request — typed, not `any`
declare global {
  namespace Express {
    interface Request {
      user?: import('@shared/types/user.types').AuthenticatedUser;
    }
  }
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided');
    }

    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);

    // Verify user still exists and is active
    const user = await User.findById(payload._id).lean();
    if (!user || !user.isActive) {
      throw ApiError.unauthorized('User no longer active');
    }

    req.user = { _id: String(user._id), email: user.email, role: user.role, name: user.name };
    next();
  } catch (err) {
    next(err);
  }
}