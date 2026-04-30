import { Schema, model, type Document, type Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, type UserRole } from '@shared/constants/roles';
import { applyBaseOptions } from '../../database/baseSchema';

// 1. Interface for the document fields
export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  refreshToken?: string;
  passwordChangedAt?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Interface for instance methods
export interface IUserMethods {
  comparePassword(candidate: string): Promise<boolean>;
  isLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

// 3. Compose the full document type
export type UserDocument = Document & IUser & IUserMethods;

// 4. Static methods type
export interface UserModel extends Model<IUser, object, IUserMethods> {
  findByEmail(email: string): Promise<UserDocument | null>;
}

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name too short'],
      maxlength: [100, 'Name too long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password too short'],
      select: false, // never returned by default queries
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.ADMIN,
    },
    isActive: { type: Boolean, default: true },
    refreshToken: { type: String, select: false },
    passwordChangedAt: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
  },
);

applyBaseOptions(userSchema);

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }
});

// Instance methods
userSchema.methods.comparePassword = async function (
  this: UserDocument,
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.isLocked = function (this: UserDocument): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

userSchema.methods.incrementLoginAttempts = async function (
  this: UserDocument,
): Promise<void> {
  // Reset if previous lock has expired
  if (this.lockUntil && this.lockUntil < new Date()) {
    await this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } });
    return;
  }
  const updates: { loginAttempts: number; lockUntil?: Date } = {
    loginAttempts: this.loginAttempts + 1,
  };
  if (this.loginAttempts + 1 >= MAX_ATTEMPTS && !this.isLocked()) {
    updates.lockUntil = new Date(Date.now() + LOCK_TIME);
  }
  await this.updateOne({ $set: updates });
};

userSchema.methods.resetLoginAttempts = async function (
  this: UserDocument,
): Promise<void> {
  await this.updateOne({ $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } });
};

// Static methods
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase().trim() }).select('+password +refreshToken');
};

export const User = model<IUser, UserModel>('User', userSchema);