import { Request, Response } from 'express';
import { blogService } from './blogs.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/ApiResponse';

/** Safely extract a required string route param */
function requireParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== 'string') return '';
  return value;
}

export const createBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await blogService.create(req.body, req.file);
  sendSuccess(res, blog, 'Blog created successfully', 201);
});

export const getAllBlogs = asyncHandler(async (req: Request, res: Response) => {
  const result = await blogService.getAll(req.query);
  sendSuccess(res, result, 'Blogs retrieved successfully');
});

export const getBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await blogService.getById(requireParam(req, 'id'));
  sendSuccess(res, blog, 'Blog retrieved successfully');
});

export const updateBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await blogService.update(requireParam(req, 'id'), req.body, req.file);
  sendSuccess(res, blog, 'Blog updated successfully');
});

export const deleteBlog = asyncHandler(async (req: Request, res: Response) => {
  await blogService.delete(requireParam(req, 'id'));
  sendSuccess(res, null, 'Blog deleted successfully');
});

export const getSuggestedSlug = asyncHandler(async (req: Request, res: Response) => {
  const { title } = req.query;

  if (typeof title !== 'string' || !title) {
    sendSuccess(res, { slug: '' }, 'Valid title query parameter is required');
    return;
  }

  const slug = await blogService.suggestSlug(title);
  sendSuccess(res, { slug }, 'Slug suggested successfully');
});
