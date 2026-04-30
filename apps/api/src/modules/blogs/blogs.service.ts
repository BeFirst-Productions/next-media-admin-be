import { Blog, IBlog } from './blogs.schema';
import { ApiError } from '../../utils/ApiError';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { compressImage } from '../../utils/imageProcessor';
import slugify from 'slugify';

export class BlogService {
  async create(data: Partial<IBlog>, file?: Express.Multer.File): Promise<IBlog> {
    if (file) {
      const compressedBuffer = await compressImage(file.buffer);
      data.blogImage = await uploadToCloudinary(compressedBuffer);
    }

    if (!data.slug && data.title) {
      data.slug = slugify(data.title, { lower: true, strict: true });
    }

    const blog = new Blog(data);
    return await blog.save();
  }

  async getAll(query: any = {}): Promise<{ blogs: IBlog[], total: number }> {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter: any = { ...query };
    delete filter.page;
    delete filter.limit;

    if (filter.search) {
      filter.title = { $regex: filter.search, $options: 'i' };
      delete filter.search;
    }

    if (filter.isActive !== undefined) {
      if (filter.isActive === 'true') filter.isActive = true;
      if (filter.isActive === 'false') filter.isActive = false;
    }

    const [blogsRaw, total] = await Promise.all([
      Blog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Blog.countDocuments(filter)
    ]);

    const blogs = blogsRaw.map(b => ({
      ...b,
      id: String(b._id),
    })) as unknown as IBlog[];

    return { blogs, total };
  }

  async getById(id: string): Promise<IBlog> {
    const blog = await Blog.findById(id);
    if (!blog) {
      throw new ApiError(404, 'Blog not found');
    }
    return blog;
  }

  async getBlogBySlug(slug: string): Promise<IBlog> {
    const blog = await Blog.findOne({ slug, isActive: true });
    if (!blog) {
      throw new ApiError(404, 'Blog not found');
    }
    return blog;
  }

  async update(id: string, data: Partial<IBlog>, file?: Express.Multer.File): Promise<IBlog> {
    if (file) {
      const compressedBuffer = await compressImage(file.buffer);
      data.blogImage = await uploadToCloudinary(compressedBuffer);
    } else {
      // If no file, don't overwrite blogImage with empty string/null if it comes from form
      delete data.blogImage;
    }

    const blog = await Blog.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!blog) {
      throw new ApiError(404, 'Blog not found');
    }
    return blog;
  }

  async delete(id: string): Promise<void> {
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      throw new ApiError(404, 'Blog not found');
    }
  }

  async suggestSlug(title: string): Promise<string> {
    let slug = slugify(title, { lower: true, strict: true });
    
    // Check if slug already exists and append suffix if needed
    let existing = await Blog.findOne({ slug });
    let counter = 1;
    let baseSlug = slug;
    while (existing) {
      slug = `${baseSlug}-${counter}`;
      existing = await Blog.findOne({ slug });
      counter++;
    }
    
    return slug;
  }
}

export const blogService = new BlogService();
