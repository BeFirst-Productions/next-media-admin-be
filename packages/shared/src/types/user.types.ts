import type { UserRole } from '../constants/roles';
import type { PaginationMeta } from './api.types';

export interface AuthenticatedUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface UserCreateInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UserPublic {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}

export interface PaginatedUsers {
  data: UserPublic[];
  meta: PaginationMeta;
}