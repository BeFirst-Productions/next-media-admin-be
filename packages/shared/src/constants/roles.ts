export const ROLES = {
  SUPER_ADMIN: 'superadmin',
  ADMIN: 'admin',
} as const;

// Derive the type from the constant — never duplicate
export type UserRole = (typeof ROLES)[keyof typeof ROLES];