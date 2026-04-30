import { User, type UserDocument } from './user.schema';
import { ApiError } from '../../utils/ApiError';
import { ROLES } from '@shared/constants/roles';
import type { CreateAdminInput } from '@shared/validators/auth.validator';
import type {
  UpdateAdminInput,
  ChangePasswordInput,
  PaginationInput,
} from '@shared/validators/user.validator';
import type { UserPublic, PaginatedUsers } from '@shared/types/user.types';

function toPublic(user: UserDocument): UserPublic {
  return {
    _id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

export async function createAdmin(input: CreateAdminInput): Promise<UserPublic> {
  const exists = await User.findOne({ email: input.email }).lean();
  if (exists) throw ApiError.conflict('Email already in use');

  const user = await User.create({ ...input, role: ROLES.ADMIN });
  return toPublic(user);
}

export async function listAdmins(query: PaginationInput): Promise<PaginatedUsers> {
  const { page, limit, search, isActive } = query;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { role: ROLES.ADMIN };
  if (typeof isActive === 'boolean') filter['isActive'] = isActive;
  if (search) {
    filter['$or'] = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
    User.countDocuments(filter),
  ]);

  return {
    data: users.map((u) => ({
      _id: String(u._id),
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
    })),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getAdminById(id: string): Promise<UserPublic> {
  const user = await User.findById(id).lean();
  if (!user) throw ApiError.notFound('Admin not found');
  return {
    _id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

export async function updateAdmin(
  id: string,
  input: UpdateAdminInput,
): Promise<UserPublic> {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('Admin not found');
  if (user.role === ROLES.SUPER_ADMIN) throw ApiError.forbidden('Cannot modify superadmin');

  if (input.email && input.email !== user.email) {
    const exists = await User.findOne({ email: input.email, _id: { $ne: id } }).lean();
    if (exists) throw ApiError.conflict('Email already in use');
  }

  if (input.name) user.name = input.name;
  if (input.email) user.email = input.email;

  await user.save({ validateModifiedOnly: true });
  return toPublic(user);
}

export async function toggleAdminStatus(id: string): Promise<UserPublic> {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('Admin not found');
  if (user.role === ROLES.SUPER_ADMIN) throw ApiError.forbidden('Cannot modify superadmin');

  user.isActive = !user.isActive;
  if (!user.isActive) {
    user.refreshToken = undefined;
  }
  await user.save({ validateModifiedOnly: true });
  return toPublic(user);
}

export async function deleteAdmin(id: string): Promise<void> {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('Admin not found');
  if (user.role === ROLES.SUPER_ADMIN) throw ApiError.forbidden('Cannot delete superadmin');
  await user.deleteOne();
}

export async function changePassword(
  userId: string,
  input: ChangePasswordInput,
): Promise<void> {
  const user = await User.findById(userId).select('+password');
  if (!user) throw ApiError.notFound('User not found');

  const isValid = await user.comparePassword(input.currentPassword);
  if (!isValid) throw ApiError.unauthorized('Current password is incorrect');

  user.password = input.newPassword;
  await user.save({ validateModifiedOnly: true });
}

export async function updateProfile(
  userId: string,
  input: UpdateAdminInput,
): Promise<UserPublic> {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  if (input.email && input.email !== user.email) {
    const exists = await User.findOne({ email: input.email, _id: { $ne: userId } }).lean();
    if (exists) throw ApiError.conflict('Email already in use');
  }

  if (input.name) user.name = input.name;
  if (input.email) user.email = input.email;

  await user.save({ validateModifiedOnly: true });
  return toPublic(user);
}