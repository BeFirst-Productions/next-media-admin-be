import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';
import { logActivity } from '../activity/activity.service';
import {
  createAdmin,
  listAdmins,
  getAdminById,
  updateAdmin,
  toggleAdminStatus,
  deleteAdmin,
  changePassword,
  updateProfile,
} from './user.service';
import { CreateAdminSchema } from '@shared/validators/auth.validator';
import {
  UpdateAdminSchema,
  ChangePasswordSchema,
  PaginationSchema,
} from '@shared/validators/user.validator';

/** Safely extract a required string route param */
function requireParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== 'string') throw ApiError.badRequest(`Missing parameter: ${name}`);
  return value;
}

// GET /api/v1/admin/admins
export const getAdmins = asyncHandler(async (req: Request, res: Response) => {
  const query = PaginationSchema.parse(req.query);
  const result = await listAdmins(query);
  sendSuccess(res, result.data, 'Admins fetched', 200, result.meta);
});

// GET /api/v1/admin/admins/:id
export const getAdmin = asyncHandler(async (req: Request, res: Response) => {
  const admin = await getAdminById(requireParam(req, 'id'));
  sendSuccess(res, admin, 'Admin fetched');
});

// POST /api/v1/admin/admins
export const createAdminHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = CreateAdminSchema.parse(req.body);
  const admin = await createAdmin(input);
  await logActivity('New admin created', 'admin', req.user?.name || 'System', `Created admin: ${admin.name} (${admin.email})`);
  sendSuccess(res, admin, 'Admin created', 201);
});

// PATCH /api/v1/admin/admins/:id
export const updateAdminHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = UpdateAdminSchema.parse(req.body);
  const updated = await updateAdmin(requireParam(req, 'id'), input);
  await logActivity('Admin profile updated', 'admin', req.user?.name || 'System', `Modified account: ${updated.email}`);
  sendSuccess(res, updated, 'Admin updated');
});

// PATCH /api/v1/admin/admins/:id/toggle
export const toggleAdmin = asyncHandler(async (req: Request, res: Response) => {
  const updated = await toggleAdminStatus(requireParam(req, 'id'));
  const action = updated.isActive ? 'User activated' : 'User deactivated';
  await logActivity(action, 'user', req.user?.name || 'System', `${updated.name} is now ${updated.isActive ? 'active' : 'inactive'}`);
  sendSuccess(res, updated, 'Admin status updated');
});

// DELETE /api/v1/admin/admins/:id
export const deleteAdminHandler = asyncHandler(async (req: Request, res: Response) => {
  await deleteAdmin(requireParam(req, 'id'));
  await logActivity('Admin deleted', 'admin', req.user?.name || 'System', `Deleted admin with ID: ${req.params.id}`);
  sendSuccess(res, null, 'Admin deleted');
});

// PATCH /api/v1/admin/admins/me/password
export const changePasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = ChangePasswordSchema.parse(req.body);
  await changePassword(req.user!._id, input);
  await logActivity('Password changed', 'security', req.user?.name || 'System');
  sendSuccess(res, null, 'Password changed successfully');
});

// PATCH /api/v1/admin/admins/me
export const updateMeHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = UpdateAdminSchema.parse(req.body);
  const updated = await updateProfile(req.user!._id, input);
  await logActivity('Profile updated', 'user', req.user?.name || 'System', 'Updated personal profile details');
  sendSuccess(res, updated, 'Profile updated');
});