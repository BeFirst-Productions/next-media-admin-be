import type { UserRole } from '../constants/roles';
import type { AuthenticatedUser } from './user.types';

// Payload stored inside the JWT token
export interface JwtPayload {
  _id: string;
  email: string;
  role: UserRole;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

// Shape returned to the client after login / token refresh
export interface AuthTokensResponse {
  accessToken: string;
}

// Login request body shape (mirrors LoginSchema inferred type)
export interface LoginRequest {
  email: string;
  password: string;
}

// Re-export for convenience — canonical definition lives in user.types.ts
export type { AuthenticatedUser };

// Response shape after successful login
export interface LoginResponse {
  accessToken: string;
  user: AuthenticatedUser;
}