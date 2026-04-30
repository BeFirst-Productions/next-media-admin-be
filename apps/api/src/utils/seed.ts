import { User } from '../modules/user/user.schema';
import { ROLES } from '@shared/constants/roles';
import { env } from '../config/env';
import { logger } from './logger';

export async function seedSuperAdmin(): Promise<void> {
  try {
    const exists = await User.findOne({ role: ROLES.SUPER_ADMIN }).lean();
    if (exists) {
      logger.info('Superadmin already exists — skipping seed');
      return;
    }

    await User.create({
      name: 'Super Admin',
      email: env.SUPER_ADMIN_EMAIL,
      password: env.SUPER_ADMIN_PASSWORD,
      role: ROLES.SUPER_ADMIN,
      isActive: true,
    });

    logger.info(`Superadmin seeded: ${env.SUPER_ADMIN_EMAIL}`);
  } catch (err) {
    logger.error('Failed to seed superadmin', { err });
    throw err;
  }
}