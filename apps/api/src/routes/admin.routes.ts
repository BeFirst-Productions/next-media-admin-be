import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/user/user.routes';
import activityRoutes from '../modules/activity/activity.routes';
import serviceRoutes from '../modules/services/services.routes';
import blogRoutes from '../modules/blogs/blogs.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Admin API is running', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/admins', userRoutes);
router.use('/activities', activityRoutes);
router.use('/services', serviceRoutes);
router.use('/blogs', blogRoutes);

export default router;