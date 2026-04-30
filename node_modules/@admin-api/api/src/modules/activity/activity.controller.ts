import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/ApiResponse';
import { getRecentActivities, logActivity } from './activity.service';
import { z } from 'zod';

const LogActivitySchema = z.object({
  action: z.string().min(1),
  type: z.enum(['admin', 'content', 'user', 'security', 'auth']),
  details: z.string().optional(),
});

export const getActivities = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
  const search = req.query.search as string | undefined;
  const activities = await getRecentActivities(limit, search);
  sendSuccess(res, activities, 'Recent activities fetched');
});

export const createActivity = asyncHandler(async (req: Request, res: Response) => {
  const { action, type, details } = LogActivitySchema.parse(req.body);
  await logActivity(action, type as any, req.user?.name || 'System', details);
  sendSuccess(res, null, 'Activity logged');
});
