import { v2 as cloudinary } from 'cloudinary';
import { ApiError } from './ApiError';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string = 'services'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        format: 'webp', // Consistent with imageProcessor
      },
      (error, result) => {
        if (error) {
          return reject(new ApiError(500, 'Cloudinary upload failed: ' + error.message));
        }
        if (!result) {
          return reject(new ApiError(500, 'Cloudinary upload failed: Empty result'));
        }
        resolve(result.secure_url);
      }
    ).end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error: any) {
    console.error('Failed to delete image from Cloudinary:', error.message);
  }
};
