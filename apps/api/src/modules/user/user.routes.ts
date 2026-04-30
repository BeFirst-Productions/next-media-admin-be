import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/rbac.middleware';
import {
  getAdmins,
  getAdmin,
  createAdminHandler,
  updateAdminHandler,
  toggleAdmin,
  deleteAdminHandler,
  changePasswordHandler,
  updateMeHandler,
} from './user.controller';
import { ROLES } from '@shared/constants/roles';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Any authenticated user can manage their own profile
router.patch('/me', updateMeHandler);
router.patch('/me/password', changePasswordHandler);

// All routes below require superadmin
router.use(authorize(ROLES.SUPER_ADMIN));

router.get('/', getAdmins);
router.post('/', createAdminHandler);
router.get('/:id', getAdmin);
router.patch('/:id', updateAdminHandler);
router.patch('/:id/toggle', toggleAdmin);
router.delete('/:id', deleteAdminHandler);

export default router;