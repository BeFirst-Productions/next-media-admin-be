import { z } from 'zod';

// Reusable field schemas — compose, don't copy-paste
const emailSchema = z
  .string({ error: 'Email is required' })
  .email('Invalid email format')
  .toLowerCase()
  .trim();

const passwordSchema = z
  .string({ error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password too long') // bcrypt 72-byte limit
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');

export const LoginSchema = z.object({
  email: emailSchema,
  password: z.string({ error: 'Password is required' }).min(1),
});

export const CreateAdminSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: emailSchema,
  password: passwordSchema,
});

// Export inferred types — no manual interface duplication
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateAdminInput = z.infer<typeof CreateAdminSchema>;