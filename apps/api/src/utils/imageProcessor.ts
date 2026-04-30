import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

/**
 * Compresses and resizes an image before uploading to Cloudinary.
 * @param buffer Input image buffer
 * @param maxWidth Maximum width of the image
 * @param quality Compression quality (1-100)
 */
export const compressImage = async (
  buffer: Buffer,
  maxWidth: number = 1200,
  quality: number = 80
): Promise<Buffer> => {
  return await sharp(buffer)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality }) // Using webp for better compression and free space utilization
    .toBuffer();
};
