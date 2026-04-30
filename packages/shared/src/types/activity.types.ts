export type ActivityType = 'admin' | 'content' | 'user' | 'security' | 'auth';

export interface ActivityPublic {
  _id: string;
  action: string;
  type: ActivityType;
  actor: string;
  details?: string;
  createdAt: Date;
}
