import { z } from 'zod';
import { ROLES } from '../constants/roles';

export const UpdateAdminSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z
    .string()
    .email('Invalid email format')
    .toLowerCase()
    .trim()
    .optional(),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72)
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  role: z.enum([ROLES.ADMIN, ROLES.SUPER_ADMIN]).optional(),
});

export type UpdateAdminInput = z.infer<typeof UpdateAdminSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;