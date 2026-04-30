import { Router } from 'express';
import { listPublished, listAll, getBySlug, create, publish, remove } from './content.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/rbac.middleware';
import { ROLES } from '@shared/constants/roles';

const router = Router();

// Public routes — no auth needed
router.get('/', listPublished);
router.get('/:slug', getBySlug);

// Protected routes — admin or superadmin
router.get('/all', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), listAll);
router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), create);
router.patch('/:id/publish', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), publish);
router.delete('/:id', authenticate, authorize(ROLES.SUPER_ADMIN), remove);

export default router;