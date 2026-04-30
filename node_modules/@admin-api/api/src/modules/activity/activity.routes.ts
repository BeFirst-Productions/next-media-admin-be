import { Router } from 'express';
import { getActivities, createActivity } from './activity.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getActivities);
router.post('/', createActivity);

export default router;
