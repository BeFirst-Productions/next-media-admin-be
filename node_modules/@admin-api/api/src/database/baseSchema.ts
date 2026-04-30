import { Schema } from 'mongoose';

// Reusable timestamp + toJSON transform applied to all schemas
export function applyBaseOptions<TDoc, TModel, TMethods>(
  schema: Schema<TDoc, TModel, TMethods>,
): void {
  schema.set('timestamps', true);
  schema.set('versionKey', false);
  schema.set('toJSON', {
    virtuals: true,
    transform: (_doc: unknown, ret: Record<string, unknown>) => {
      ret['id'] = String(ret['_id']);
      delete ret['_id'];
      delete ret['__v'];
      return ret;
    },
  });
}