import { Service, IService } from './services.schema';
import { ApiError } from '../../utils/ApiError';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { compressImage } from '../../utils/imageProcessor';
import slugify from 'slugify';

export class ServicesService {
  async createService(data: Partial<IService>, file?: Express.Multer.File): Promise<IService> {
    if (file) {
      const compressedBuffer = await compressImage(file.buffer);
      data.serviceImage = await uploadToCloudinary(compressedBuffer);
    }

    if (!data.slug && data.title) {
      data.slug = slugify(data.title, { lower: true, strict: true });
    }

    const service = new Service(data);
    return await service.save();
  }

  async getAllServices(query: any = {}): Promise<{ services: IService[], total: number }> {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 6;
    const skip = (page - 1) * limit;

    // Remove pagination params from filter query
    const filter = { ...query };
    delete filter.page;
    delete filter.limit;

    if (filter.search) {
      filter.title = { $regex: filter.search, $options: 'i' };
      delete filter.search;
    }

    const [servicesRaw, total] = await Promise.all([
      Service.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Service.countDocuments(filter)
    ]);

    const services = servicesRaw.map(s => ({
      ...s,
      id: String(s._id),
    })) as unknown as IService[];

    return { services, total };
  }

  async getServiceById(id: string): Promise<IService> {
    const service = await Service.findById(id);
    if (!service) {
      throw new ApiError(404, 'Service not found');
    }
    return service;
  }

  async getServiceBySlug(slug: string): Promise<IService> {
    const service = await Service.findOne({ slug });
    if (!service) {
      throw new ApiError(404, 'Service not found');
    }
    return service;
  }

  async updateService(id: string, data: Partial<IService>, file?: Express.Multer.File): Promise<IService> {
    if (file) {
      const compressedBuffer = await compressImage(file.buffer);
      data.serviceImage = await uploadToCloudinary(compressedBuffer);
    }

    const service = await Service.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!service) {
      throw new ApiError(404, 'Service not found');
    }
    return service;
  }

  async deleteService(id: string): Promise<void> {
    const service = await Service.findByIdAndDelete(id);
    if (!service) {
      throw new ApiError(404, 'Service not found');
    }
    // Optional: Delete image from cloudinary if publicId is stored or can be extracted
  }

  async suggestSlug(title: string): Promise<string> {
    return slugify(title, { lower: true, strict: true });
  }
}
