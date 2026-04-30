import { Router } from 'express';
import * as blogController from './blogs.controller';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/suggest-slug', blogController.getSuggestedSlug);

router.route('/')
  .get(blogController.getAllBlogs)
  .post(upload.single('blogImage'), blogController.createBlog);

router.route('/:id')
  .get(blogController.getBlog)
  .patch(upload.single('blogImage'), blogController.updateBlog)
  .delete(blogController.deleteBlog);

export default router;
