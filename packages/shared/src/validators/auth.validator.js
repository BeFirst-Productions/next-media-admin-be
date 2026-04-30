"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAdminSchema = exports.LoginSchema = void 0;
const zod_1 = require("zod");
// Reusable field schemas — compose, don't copy-paste
const emailSchema = zod_1.z
    .string({ error: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim();
const passwordSchema = zod_1.z
    .string({ error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password too long') // bcrypt 72-byte limit
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');
exports.LoginSchema = zod_1.z.object({
    email: emailSchema,
    password: zod_1.z.string({ error: 'Password is required' }).min(1),
});
exports.CreateAdminSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2).max(100),
    email: emailSchema,
    password: passwordSchema,
});
