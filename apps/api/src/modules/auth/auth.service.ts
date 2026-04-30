import { User } from '../user/user.schema';
import { ApiError } from '../../utils/ApiError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../config/jwt';
import type { LoginInput } from '@shared/validators/auth.validator';
import { logActivity } from '../activity/activity.service';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export async function loginUser(input: LoginInput): Promise<AuthTokens> {
  const user = await User.findByEmail(input.email);

  if (!user) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been deactivated. Please contact a Superadmin.');
  }

  if (user.isLocked()) {
    throw ApiError.forbidden('Account locked due to too many failed attempts. Try again in 2 hours.');
  }

  const isPasswordValid = await user.comparePassword(input.password);
  if (!isPasswordValid) {
    await user.incrementLoginAttempts();
    throw ApiError.unauthorized('Invalid credentials');
  }

  await user.resetLoginAttempts();

  const authUser = { _id: String(user._id), email: user.email, role: user.role, name: user.name };
  const accessToken = signAccessToken(authUser);
  const refreshToken = signRefreshToken(authUser);

  user.refreshToken = refreshToken;
  await user.save({ validateModifiedOnly: true });

  await logActivity('Login successful', 'auth', user.name, `Authenticated as ${user.role}`);

  return { accessToken, refreshToken };
}

export async function refreshTokens(token: string): Promise<AuthTokens> {
  const payload = verifyRefreshToken(token);

  const user = await User.findById(payload._id).select('+refreshToken');
  if (!user || !user.isActive || user.refreshToken !== token) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const authUser = { _id: String(user._id), email: user.email, role: user.role, name: user.name };
  const accessToken = signAccessToken(authUser);
  const refreshToken = signRefreshToken(authUser);

  user.refreshToken = refreshToken;
  await user.save({ validateModifiedOnly: true });

  return { accessToken, refreshToken };
}

export async function logoutUser(userId: string): Promise<void> {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
}