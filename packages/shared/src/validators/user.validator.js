"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationSchema = exports.ChangePasswordSchema = exports.UpdateAdminSchema = void 0;
const zod_1 = require("zod");
const roles_1 = require("../constants/roles");
exports.UpdateAdminSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2).max(100).optional(),
    email: zod_1.z
        .string()
        .email('Invalid email format')
        .toLowerCase()
        .trim()
        .optional(),
});
exports.ChangePasswordSchema = zod_1.z
    .object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(72)
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: zod_1.z.string().min(1, 'Please confirm your password'),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
exports.PaginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
    search: zod_1.z.string().trim().optional(),
    isActive: zod_1.z
        .enum(['true', 'false'])
        .transform((v) => v === 'true')
        .optional(),
    role: zod_1.z.enum([roles_1.ROLES.ADMIN, roles_1.ROLES.SUPER_ADMIN]).optional(),
});
