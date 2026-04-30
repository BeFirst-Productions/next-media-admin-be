import { Activity } from './activity.schema';
import type { ActivityPublic, ActivityType } from '@shared/types/activity.types';

export async function logActivity(action: string, type: ActivityType, actor: string, details?: string): Promise<void> {
  await Activity.create({ action, type, actor, details });
}

export async function getRecentActivities(limit: number = 20, search?: string): Promise<ActivityPublic[]> {
  const filter: Record<string, any> = {};
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { action: searchRegex },
      { actor: searchRegex },
      { type: searchRegex }
    ];
  }
  const activities = await Activity.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  return activities.map((a) => ({
    _id: String(a._id),
    action: a.action,
    type: a.type as ActivityType,
    actor: a.actor,
    details: a.details,
    createdAt: a.createdAt,
  }));
}
