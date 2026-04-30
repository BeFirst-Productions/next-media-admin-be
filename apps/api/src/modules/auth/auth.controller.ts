import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/ApiResponse';
import { loginUser, refreshTokens, logoutUser } from './auth.service';
import { logActivity } from '../activity/activity.service';
import { LoginSchema } from '@shared/validators/auth.validator';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = LoginSchema.parse(req.body); // throws ZodError if invalid
  const { accessToken, refreshToken } = await loginUser(input);

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
  sendSuccess(res, { accessToken }, 'Login successful');
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken as string | undefined;
  if (!token) throw new (await import('../../utils/ApiError')).ApiError(401, 'No refresh token');

  const { accessToken, refreshToken } = await refreshTokens(token);
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
  sendSuccess(res, { accessToken }, 'Token refreshed');
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await logActivity('Logout successful', 'auth', req.user?.name || 'System', 'Session terminated by user');
  await logoutUser(req.user!._id);
  res.clearCookie('refreshToken');
  sendSuccess(res, null, 'Logged out successfully');
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, req.user, 'Profile fetched');
});