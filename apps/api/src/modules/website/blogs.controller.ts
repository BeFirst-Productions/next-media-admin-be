import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/ApiResponse';
import { blogService } from '../blogs/blogs.service';

export const getPublicBlogs = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10; // Default 10: 1 featured + 9 in list
  const search = req.query.search as string | undefined;

  const result = await blogService.getAll({
    page,
    limit,
    search,
    isActive: true 
  });

  sendSuccess(res, result, 'Blogs fetched successfully');
});

export const getLatestBlogs = asyncHandler(async (req: Request, res: Response) => {
  const result = await blogService.getAll({
    page: 1,
    limit: 6,
    isActive: true
  });

  sendSuccess(res, result.blogs, 'Latest 6 blogs fetched successfully');
});

export const getBlogBySlug = asyncHandler(async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  const blog = await blogService.getBlogBySlug(slug);
  sendSuccess(res, blog, 'Blog details fetched successfully');
});
