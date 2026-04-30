import { Router } from 'express';
import * as blogsController from './blogs.controller';

const router = Router();

router.get('/', blogsController.getPublicBlogs);
router.get('/latest', blogsController.getLatestBlogs);
router.get('/:slug', blogsController.getBlogBySlug);

export default router;
