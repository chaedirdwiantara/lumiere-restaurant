import sharp from 'sharp';
import { supabaseService, supabaseStorage } from '../config/database';
import { ValidationError, NotFoundError, FileUploadError } from '../utils/errors';
import { logger } from '../utils/logger';
import type { GalleryImage, ImageVariant, ProcessedImage, FileUpload } from '../types';

export class GalleryService {
  private readonly bucketName = 'gallery-images';
  private readonly allowedFormats = ['jpeg', 'jpg', 'png', 'webp', 'avif'];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  /**
   * Get all gallery images with optional filtering
   */
  async getImages(options: {
    isActive?: boolean;
    isFeatured?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ images: GalleryImage[]; total: number }> {
    try {
      let query = supabaseService
        .from('gallery_images')
        .select(`
          *,
          image_variants!gallery_image_id (*)
        `, { count: 'exact' })
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      // Apply filters
      if (options.isActive !== undefined) {
        query = query.eq('is_active', options.isActive);
      }

      if (options.isFeatured !== undefined) {
        query = query.eq('is_featured', options.isFeatured);
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data: images, error, count } = await query;

      if (error) {
        logger.error('Error fetching gallery images', error);
        throw new ValidationError('Failed to fetch gallery images');
      }

      logger.info('Gallery images fetched successfully', {
        count: images?.length || 0,
        total: count || 0,
        hasVariants: images?.some(img => img.image_variants && img.image_variants.length > 0)
      });

      return {
        images: images || [],
        total: count || 0
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      logger.error('Gallery service error', error);
      throw new ValidationError('Failed to fetch gallery images');
    }
  }

  /**
   * Get single gallery image by ID
   */
  async getImageById(id: string): Promise<GalleryImage> {
    try {
      const { data: image, error } = await supabaseService
        .from('gallery_images')
        .select(`
          *,
          image_variants (*)
        `)
        .eq('id', id)
        .single();

      if (error || !image) {
        throw new NotFoundError('Gallery image not found');
      }

      return image;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error('Error fetching gallery image', error);
      throw new ValidationError('Failed to fetch gallery image');
    }
  }

  /**
   * Upload and process image with multiple variants
   */
  async uploadImage(
    file: FileUpload,
    imageData: Omit<GalleryImage, 'id' | 'original_url' | 'created_at' | 'updated_at'>,
    adminId: string
  ): Promise<GalleryImage> {
    try {
      // Validate file
      this.validateFile(file);

      // Process image and create variants
      const processedImages = await this.processImageVariants(file);

      // Upload original and variants to storage
      const uploadedImages = await this.uploadToStorage(processedImages, file.originalname);

      // Create gallery image record
      const { data: galleryImage, error: insertError } = await supabaseService
        .from('gallery_images')
        .insert({
          ...imageData,
          original_url: uploadedImages.original.url,
          uploaded_by: adminId
        })
        .select()
        .single();

      if (insertError || !galleryImage) {
        // Clean up uploaded files if database insert fails
        await this.cleanupUploadedFiles(uploadedImages);
        throw new ValidationError('Failed to create gallery image record');
      }

      // Create image variant records
      const variants = Object.entries(uploadedImages.variants).map(([type, data]) => ({
        gallery_image_id: galleryImage.id,
        variant_type: type,
        url: data.url,
        width: data.width,
        height: data.height,
        file_size: data.size,
        format: data.format
      }));

      logger.info('Creating image variants', {
        imageId: galleryImage.id,
        variantCount: variants.length,
        variants: variants.map(v => ({ type: v.variant_type, url: v.url }))
      });

      const { error: variantsError } = await supabaseService
        .from('image_variants')
        .insert(variants);

      if (variantsError) {
        logger.error('Error creating image variants', {
          error: variantsError,
          variants: variants
        });
        // Continue without variants - original image is still available
      } else {
        logger.info('Image variants created successfully', {
          imageId: galleryImage.id,
          variantCount: variants.length
        });
      }

      logger.info('Gallery image uploaded successfully', {
        imageId: galleryImage.id,
        title: galleryImage.title,
        adminId
      });

      return await this.getImageById(galleryImage.id);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof FileUploadError) {
        throw error;
      }
      logger.error('Image upload error', error);
      throw new FileUploadError('Failed to upload image');
    }
  }

  /**
   * Update gallery image
   */
  async updateImage(
    id: string,
    updateData: Partial<Omit<GalleryImage, 'id' | 'created_at' | 'updated_at' | 'uploaded_by'>>,
    adminId: string
  ): Promise<GalleryImage> {
    try {
      // Check if image exists
      await this.getImageById(id);

      const { data: updatedImage, error } = await supabaseService
        .from('gallery_images')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error || !updatedImage) {
        throw new ValidationError('Failed to update gallery image');
      }

      logger.info('Gallery image updated successfully', {
        imageId: id,
        adminId
      });

      return await this.getImageById(id);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      logger.error('Image update error', error);
      throw new ValidationError('Failed to update gallery image');
    }
  }

  /**
   * Delete gallery image and its variants
   */
  async deleteImage(id: string, adminId: string): Promise<void> {
    try {
      // Get image with variants for cleanup
      const image = await this.getImageById(id);

      // Delete from database (cascades to variants)
      const { error } = await supabaseService
        .from('gallery_images')
        .delete()
        .eq('id', id);

      if (error) {
        throw new ValidationError('Failed to delete gallery image');
      }

      // Clean up storage files
      await this.cleanupImageFiles(image);

      logger.info('Gallery image deleted successfully', {
        imageId: id,
        adminId
      });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      logger.error('Image deletion error', error);
      throw new ValidationError('Failed to delete gallery image');
    }
  }

  /**
   * Reorder gallery images
   */
  async reorderImages(imageOrders: { id: string; display_order: number }[]): Promise<void> {
    try {
      const updates = imageOrders.map(({ id, display_order }) =>
        supabaseService
          .from('gallery_images')
          .update({ display_order })
          .eq('id', id)
      );

      await Promise.all(updates);

      logger.info('Gallery images reordered successfully', {
        count: imageOrders.length
      });
    } catch (error) {
      logger.error('Image reorder error', error);
      throw new ValidationError('Failed to reorder gallery images');
    }
  }

  /**
   * Validate uploaded file
   */
  private validateFile(file: FileUpload): void {
    if (!file) {
      throw new FileUploadError('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new FileUploadError(`File size exceeds maximum limit of ${this.maxFileSize / 1024 / 1024}MB`);
    }

    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    if (!fileExtension || !this.allowedFormats.includes(fileExtension)) {
      throw new FileUploadError(`Invalid file format. Allowed formats: ${this.allowedFormats.join(', ')}`);
    }
  }

  /**
   * Process image into multiple variants
   */
  private async processImageVariants(file: FileUpload): Promise<ProcessedImage> {
    try {
      logger.info('Starting image processing', {
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        bufferLength: file.buffer?.length
      });

      if (!file.buffer) {
        throw new Error('No file buffer provided');
      }

      // First, validate the image buffer by trying to create Sharp instance
      let image: sharp.Sharp;
      let metadata: sharp.Metadata;
      
      try {
        image = sharp(file.buffer);
        logger.info('Sharp instance created, getting metadata...');
        metadata = await image.metadata();
        
        // Validate metadata
        if (!metadata.width || !metadata.height || metadata.width < 1 || metadata.height < 1) {
          throw new Error('Invalid image dimensions');
        }
        
        logger.info('Image metadata retrieved and validated', {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          channels: metadata.channels,
          density: metadata.density
        });
      } catch (sharpError) {
        logger.error('Sharp processing failed, attempting to use original image as fallback', {
          error: sharpError.message,
          filename: file.originalname
        });
        
        // Return a fallback result with just the original image
        return {
          original: {
            buffer: file.buffer,
            width: 800, // Default dimensions
            height: 600,
            size: file.size,
            format: file.mimetype?.split('/')[1] || 'jpeg',
            url: ''
          },
          variants: [] // Empty variants - will use original for all sizes
        };
      }
      


      const variants: Record<string, { buffer: Buffer; width: number; height: number; size: number; format: string; url?: string }> = {};

      // Thumbnail (300x300)
      logger.info('Processing thumbnail variant...');
      const thumbnailBuffer = await image
        .resize(300, 300, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 80 })
        .toBuffer();

      variants.thumbnail = {
        buffer: thumbnailBuffer,
        width: 300,
        height: 300,
        size: thumbnailBuffer.length,
        format: 'jpeg'
      };
      logger.info('Thumbnail variant processed successfully', { size: thumbnailBuffer.length });

      // Medium (800x600)
      logger.info('Processing medium variant...');
      const mediumBuffer = await image
        .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      variants.medium = {
        buffer: mediumBuffer,
        width: Math.min(metadata.width || 800, 800),
        height: Math.min(metadata.height || 600, 600),
        size: mediumBuffer.length,
        format: 'jpeg'
      };
      logger.info('Medium variant processed successfully', { size: mediumBuffer.length });

      // Large (1920x1080)
      logger.info('Processing large variant...');
      const largeBuffer = await image
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toBuffer();

      variants.large = {
        buffer: largeBuffer,
        width: Math.min(metadata.width || 1920, 1920),
        height: Math.min(metadata.height || 1080, 1080),
        size: largeBuffer.length,
        format: 'jpeg'
      };
      logger.info('Large variant processed successfully', { size: largeBuffer.length });

      // WebP version (for modern browsers)
      logger.info('Processing WebP variant...');
      const webpBuffer = await image
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();

      variants.webp = {
        buffer: webpBuffer,
        width: Math.min(metadata.width || 1920, 1920),
        height: Math.min(metadata.height || 1080, 1080),
        size: webpBuffer.length,
        format: 'webp'
      };
      logger.info('WebP variant processed successfully', { size: webpBuffer.length });

      logger.info('All image variants processed successfully', {
        originalSize: file.size,
        variantCount: Object.keys(variants).length,
        variants: Object.keys(variants).map(key => ({
          type: key,
          size: variants[key].size
        }))
      });

      return {
        original: {
          buffer: file.buffer,
          width: metadata.width || 0,
          height: metadata.height || 0,
          size: file.size,
          format: metadata.format || 'jpeg',
          url: ''
        },
        variants
      };
    } catch (sharpError) {
      logger.error('Image processing error', {
        error: sharpError.message,
        stack: sharpError.stack,
        filename: file?.originalname,
        fileSize: file?.size,
        mimetype: file?.mimetype,
        hasBuffer: !!file?.buffer,
        bufferLength: file?.buffer?.length
      });

      // Fallback: return original image without variants
      logger.warn('Using fallback mechanism - returning original image without variants', {
        filename: file?.originalname
      });

      return {
        original: {
          buffer: file.buffer,
          width: 800, // Default dimensions
          height: 600,
          size: file.size,
          format: 'jpeg',
          url: ''
        },
        variants: [] // Empty variants array when processing fails
      };
    }
  }

  /**
   * Upload processed images to Supabase storage
   */
  private async uploadToStorage(
    processedImages: ProcessedImage,
    originalName: string
  ): Promise<{
    original: { url: string; width: number; height: number; size: number; format: string; buffer: Buffer };
    variants: Record<string, { url: string; width: number; height: number; size: number; format: string }>;
  }> {
    try {
      const timestamp = Date.now();
      const baseName = originalName.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
      const results: any = { variants: {} };

      logger.info('Starting storage upload', {
        bucketName: this.bucketName,
        originalName,
        baseName,
        timestamp
      });

      // Upload original
      const originalPath = `originals/${timestamp}-${baseName}.${processedImages.original.format}`;
      
      logger.info('Uploading original image', {
        path: originalPath,
        size: processedImages.original.buffer.length,
        format: processedImages.original.format
      });

      const { data: originalData, error: originalError } = await supabaseStorage
        .from(this.bucketName)
        .upload(originalPath, processedImages.original.buffer, {
          contentType: `image/${processedImages.original.format}`,
          cacheControl: '3600'
        });

      if (originalError) {
        logger.error('Original upload error', originalError);
        throw new FileUploadError(`Failed to upload original image: ${originalError.message}`);
      }

      const { data: originalUrl } = supabaseStorage
        .from(this.bucketName)
        .getPublicUrl(originalPath);

      results.original = { 
        url: originalUrl.publicUrl,
        width: processedImages.original.width,
        height: processedImages.original.height,
        size: processedImages.original.size,
        format: processedImages.original.format,
        buffer: processedImages.original.buffer
      };

      // Upload variants
      for (const [variantType, variantData] of Object.entries(processedImages.variants)) {
        const variantPath = `variants/${timestamp}-${baseName}-${variantType}.${variantData.format}`;
        
        logger.info('Uploading variant', {
          type: variantType,
          path: variantPath,
          size: variantData.buffer.length,
          format: variantData.format
        });

        const { error: variantError } = await supabaseStorage
          .from(this.bucketName)
          .upload(variantPath, variantData.buffer, {
            contentType: `image/${variantData.format}`,
            cacheControl: '3600'
          });

        if (variantError) {
          logger.error(`Variant upload error for ${variantType}`, variantError);
          // Continue with other variants even if one fails
        } else {
          const { data: variantUrl } = supabaseStorage
            .from(this.bucketName)
            .getPublicUrl(variantPath);

          results.variants[variantType] = {
            url: variantUrl.publicUrl,
            width: variantData.width,
            height: variantData.height,
            size: variantData.size,
            format: variantData.format
          };
          
          logger.info(`Successfully uploaded variant ${variantType}`);
        }
      }

      logger.info('Storage upload completed', {
        originalUploaded: !!results.original,
        variantsUploaded: Object.keys(results.variants).length
      });

      return results;
    } catch (error) {
      logger.error('Storage upload error details', {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        bucketName: this.bucketName
      });
      throw new FileUploadError(`Failed to upload images to storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clean up uploaded files from storage
   */
  private async cleanupUploadedFiles(uploadedImages: any): Promise<void> {
    try {
      const filesToDelete: string[] = [];

      // Extract file paths from URLs
      if (uploadedImages.original?.url) {
        const originalPath = this.extractPathFromUrl(uploadedImages.original.url);
        if (originalPath) filesToDelete.push(originalPath);
      }

      Object.values(uploadedImages.variants || {}).forEach((variant: any) => {
        if (variant?.url) {
          const variantPath = this.extractPathFromUrl(variant.url);
          if (variantPath) filesToDelete.push(variantPath);
        }
      });

      if (filesToDelete.length > 0) {
        await supabaseStorage.from(this.bucketName).remove(filesToDelete);
      }
    } catch (error) {
      logger.error('Cleanup error', error);
      // Don't throw - this is cleanup
    }
  }

  /**
   * Clean up image files when deleting gallery image
   */
  private async cleanupImageFiles(image: GalleryImage): Promise<void> {
    try {
      const filesToDelete: string[] = [];

      // Add original image path
      const originalPath = this.extractPathFromUrl(image.original_url);
      if (originalPath) filesToDelete.push(originalPath);

      // Add variant paths
      if (image.image_variants) {
        image.image_variants.forEach((variant: ImageVariant) => {
          const variantPath = this.extractPathFromUrl(variant.url);
          if (variantPath) filesToDelete.push(variantPath);
        });
      }

      if (filesToDelete.length > 0) {
        await supabaseStorage.from(this.bucketName).remove(filesToDelete);
      }
    } catch (error) {
      logger.error('File cleanup error', error);
      // Don't throw - this is cleanup
    }
  }

  /**
   * Extract file path from Supabase storage URL
   */
  private extractPathFromUrl(url: string): string | null {
    try {
      const urlParts = url.split(`/storage/v1/object/public/${this.bucketName}/`);
      return urlParts[1] || null;
    } catch {
      return null;
    }
  }
}

export const galleryService = new GalleryService();