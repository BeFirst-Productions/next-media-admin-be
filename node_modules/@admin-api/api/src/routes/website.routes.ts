import { Router } from 'express';
import contentRoutes from '../modules/website/content.routes';
import blogsRoutes from '../modules/website/blogs.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Website API is running', timestamp: new Date().toISOString() });
});

router.use('/content', contentRoutes);
router.use('/blogs', blogsRoutes);

export default router;