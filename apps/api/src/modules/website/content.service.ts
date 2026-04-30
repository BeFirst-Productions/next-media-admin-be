import { Content, type ContentDocument } from './content.schema';
import { ApiError } from '../../utils/ApiError';
import { Types } from 'mongoose';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function getPublishedContent(search?: string): Promise<ContentDocument[]> {
  const filter: Record<string, any> = { isPublished: true };
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [{ title: searchRegex }, { body: searchRegex }];
  }
  return Content.find(filter)
    .sort({ publishedAt: -1 })
    .lean() as unknown as ContentDocument[];
}

export async function getAllContent(search?: string): Promise<ContentDocument[]> {
  const filter: Record<string, any> = {};
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [{ title: searchRegex }, { body: searchRegex }];
  }
  return Content.find(filter)
    .sort({ createdAt: -1 })
    .lean() as unknown as ContentDocument[];
}

export async function getContentBySlug(slug: string): Promise<ContentDocument> {
  const content = await Content.findOne({ slug, isPublished: true }).lean();
  if (!content) throw ApiError.notFound('Content not found');
  return content as unknown as ContentDocument;
}

export async function createContent(
  data: { title: string; body: string; excerpt?: string; tags?: string[] },
  createdBy: string,
): Promise<ContentDocument> {
  const slug = slugify(data.title);
  const exists = await Content.findOne({ slug }).lean();
  if (exists) throw ApiError.conflict('A post with this title already exists');

  return Content.create({ ...data, slug, createdBy: new Types.ObjectId(createdBy) });
}

export async function publishContent(id: string): Promise<ContentDocument> {
  const content = await Content.findById(id);
  if (!content) throw ApiError.notFound('Content not found');
  content.isPublished = true;
  await content.save({ validateModifiedOnly: true });
  return content;
}

export async function deleteContent(id: string): Promise<void> {
  const content = await Content.findById(id);
  if (!content) throw ApiError.notFound('Content not found');
  await content.deleteOne();
}