import { Schema, model, Document } from 'mongoose';
import { applyBaseOptions } from '../../database/baseSchema';

export interface IBlog extends Document {
  title: string;
  excerpt: string;
  blogImage: string;
  slug: string;
  content: string;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>({
  title: { type: String, required: true, trim: true },
  excerpt: { type: String, required: true },
  blogImage: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  content: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  metaKeywords: { type: String, default: '' },
  canonicalUrl: { type: String, default: '' },
}, {
  timestamps: true
});

applyBaseOptions(BlogSchema);

export const Blog = model<IBlog>('Blog', BlogSchema);
