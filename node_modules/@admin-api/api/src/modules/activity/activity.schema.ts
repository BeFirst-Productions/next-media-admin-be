import { Schema, model, type Document } from 'mongoose';
import type { ActivityType } from '@shared/types/activity.types';

export interface ActivityDocument extends Document {
  action: string;
  type: ActivityType;
  actor: string;
  details?: string;
  createdAt: Date;
}

const ActivitySchema = new Schema<ActivityDocument>(
  {
    action: { type: String, required: true },
    type: { type: String, enum: ['admin', 'content', 'user', 'security', 'auth'], required: true },
    actor: { type: String, required: true },
    details: { type: String },
    // Data expires after 30 days automatically
    createdAt: { type: Date, default: Date.now, expires: '30d' },
  },
  {
    timestamps: false,
  }
);

export const Activity = model<ActivityDocument>('Activity', ActivitySchema);
