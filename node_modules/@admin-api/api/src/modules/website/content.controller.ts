import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';
import { logActivity } from '../activity/activity.service';
import {
  getPublishedContent,
  getAllContent,
  getContentBySlug,
  createContent,
  publishContent,
  deleteContent,
} from './content.service';
import { z } from 'zod';

/** Safely extract a required string route param */
function requireParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== 'string') throw ApiError.badRequest(`Missing parameter: ${name}`);
  return value;
}

const CreateContentSchema = z.object({
  title: z.string().trim().min(3).max(200),
  body: z.string().min(10),
  excerpt: z.string().max(500).optional(),
  tags: z.array(z.string().trim().toLowerCase()).max(10).optional(),
});

export const listPublished = asyncHandler(async (req: Request, res: Response) => {
  const search = req.query.search as string | undefined;
  const content = await getPublishedContent(search);
  sendSuccess(res, content, 'Published content fetched');
});

export const listAll = asyncHandler(async (req: Request, res: Response) => {
  const search = req.query.search as string | undefined;
  const content = await getAllContent(search);
  sendSuccess(res, content, 'All content fetched');
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const content = await getContentBySlug(requireParam(req, 'slug'));
  sendSuccess(res, content, 'Content fetched');
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = CreateContentSchema.parse(req.body);
  const content = await createContent(input, req.user!._id);
  await logActivity('Content created', 'content', req.user?.name || 'System', `Title: "${content.title.substring(0, 30)}..."`);
  sendSuccess(res, content, 'Content created', 201);
});

export const publish = asyncHandler(async (req: Request, res: Response) => {
  const content = await publishContent(requireParam(req, 'id'));
  await logActivity('Content published', 'content', req.user?.name || 'System', `Post: "${content.title.substring(0, 30)}..."`);
  sendSuccess(res, content, 'Content published');
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deleteContent(requireParam(req, 'id'));
  await logActivity('Content deleted', 'content', req.user?.name || 'System', `Removed post ID: ${req.params.id}`);
  sendSuccess(res, null, 'Content deleted');
});