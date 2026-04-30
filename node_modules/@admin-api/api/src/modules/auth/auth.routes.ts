import { Router } from 'express';
import { login, refresh, logout, me } from './auth.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authLimiter } from '../../middlewares/rateLimiter.middleware';

const router = Router();

router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

export default router;