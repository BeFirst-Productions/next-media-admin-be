import jwt from 'jsonwebtoken';
import { env } from './env';
import type { AuthenticatedUser } from '@shared/types/user.types';

type TokenType = 'access' | 'refresh';

interface TokenPayload extends AuthenticatedUser {
  type: TokenType;
}

export function signAccessToken(user: AuthenticatedUser): string {
  return jwt.sign(
    { _id: user._id, email: user.email, role: user.role, type: 'access' } satisfies TokenPayload,
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN, algorithm: 'HS256' } as jwt.SignOptions,
  );
}

export function signRefreshToken(user: AuthenticatedUser): string {
  return jwt.sign(
    { _id: user._id, email: user.email, role: user.role, type: 'refresh' } satisfies TokenPayload,
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN, algorithm: 'HS256' } as jwt.SignOptions,
  );
}

export function verifyAccessToken(token: string): TokenPayload {
  const payload = jwt.verify(token, env.JWT_SECRET, {
    algorithms: ['HS256'], // explicit algorithm list prevents algorithm confusion attacks
  }) as TokenPayload;

  if (payload.type !== 'access') {
    throw new jwt.JsonWebTokenError('Invalid token type');
  }
  return payload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET, {
    algorithms: ['HS256'],
  }) as TokenPayload;

  if (payload.type !== 'refresh') {
    throw new jwt.JsonWebTokenError('Invalid token type');
  }
  return payload;
}