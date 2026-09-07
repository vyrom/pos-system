import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadedFilePayload {
  fieldname?: string;
  originalname: string;
  encoding?: string;
  mimetype?: string;
  size: number;
  buffer: Buffer;
}

export interface ProcessedImageResult {
  imageUrl: string;
  filename: string;
  originalName: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  savingsPercentage: string;
  width: number;
  height: number;
  format: string;
}

@Injectable()
export class ImageProcessorService {
  private readonly logger = new Logger(ImageProcessorService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'products');

  constructor() {
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      this.logger.log(`Created upload directory: ${this.uploadDir}`);
    }
  }

  /**
   * Process, auto-resize to standard POS dimensions (500x500), compress, and save locally.
   */
  async processAndSaveImage(
    file: UploadedFilePayload,
    targetWidth = 500,
    targetHeight = 500,
    quality = 80,
  ): Promise<ProcessedImageResult> {
    if (!file || !file.buffer) {
      throw new BadRequestException('No valid image file buffer received');
    }

    this.ensureDirectoryExists();

    const timestamp = Date.now();
    const randomHash = Math.random().toString(36).substring(2, 8);
    const sanitizedOriginalName = path
      .parse(file.originalname)
      .name.replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);

    const filename = `prod_${sanitizedOriginalName}_${timestamp}_${randomHash}.webp`;
    const outputPath = path.join(this.uploadDir, filename);

    let compressedSizeBytes = file.size;
    let format = 'webp';
    let width = targetWidth;
    let height = targetHeight;

    try {
      // Dynamic import of sharp to ensure smooth execution
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const sharp = require('sharp');

      const processedBuffer = await sharp(file.buffer)
        .resize(targetWidth, targetHeight, {
          fit: 'inside',
          withoutEnlargement: false,
        })
        .webp({
          quality: 85,
          effort: 4,
          lossless: false,
        })
        .toBuffer();

      await fs.promises.writeFile(outputPath, processedBuffer);
      compressedSizeBytes = processedBuffer.length;
      this.logger.log(`Sharp processed image saved to ${filename} (${file.size} -> ${compressedSizeBytes} bytes)`);
    } catch (sharpError) {
      this.logger.warn(`Sharp processing skipped/failed: ${sharpError?.message || sharpError}. Saving original buffer directly.`);

      // Fallback: save original buffer with original or webp extension
      const fallbackExt = path.extname(file.originalname) || '.jpg';
      const fallbackFilename = `prod_${sanitizedOriginalName}_${timestamp}_${randomHash}${fallbackExt}`;
      const fallbackPath = path.join(this.uploadDir, fallbackFilename);

      await fs.promises.writeFile(fallbackPath, file.buffer);
      compressedSizeBytes = file.size;
      format = fallbackExt.replace('.', '');

      return {
        imageUrl: `/uploads/products/${fallbackFilename}`,
        filename: fallbackFilename,
        originalName: file.originalname,
        originalSizeBytes: file.size,
        compressedSizeBytes,
        savingsPercentage: '0%',
        width: 0,
        height: 0,
        format,
      };
    }

    const savings = Math.max(0, Math.round(((file.size - compressedSizeBytes) / file.size) * 100));

    return {
      imageUrl: `/uploads/products/${filename}`,
      filename,
      originalName: file.originalname,
      originalSizeBytes: file.size,
      compressedSizeBytes,
      savingsPercentage: `${savings}%`,
      width,
      height,
      format,
    };
  }

  /**
   * Delete an existing image file from local storage
   */
  async deleteLocalImage(relativeUrl?: string): Promise<boolean> {
    if (!relativeUrl || !relativeUrl.includes('/uploads/products/')) {
      return false;
    }

    try {
      const filename = path.basename(relativeUrl);
      const filePath = path.join(this.uploadDir, filename);

      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        this.logger.log(`Deleted orphaned product image: ${filename}`);
        return true;
      }
    } catch (err) {
      this.logger.error(`Error deleting image ${relativeUrl}:`, err);
    }
    return false;
  }
}
