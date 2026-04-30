import { Schema, model, Types, type Document } from 'mongoose';
import { applyBaseOptions } from '../../database/baseSchema';

export interface IContent {
  title: string;
  slug: string;
  body: string;
  excerpt?: string;
  isPublished: boolean;
  publishedAt?: Date;
  tags: string[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type ContentDocument = Document & IContent;

const contentSchema = new Schema<IContent>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title too long'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    body: { type: String, required: [true, 'Body is required'] },
    excerpt: { type: String, maxlength: 500 },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    tags: [{ type: String, trim: true, lowercase: true }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
);

applyBaseOptions(contentSchema);

// Auto-set publishedAt when isPublished flips to true
contentSchema.pre('save', function () {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

export const Content = model<IContent>('Content', contentSchema);