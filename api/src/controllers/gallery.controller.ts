import { Request, Response } from 'express';
import { galleryService } from '../services/gallery.service';
import { ValidationError, NotFoundError, FileUploadError } from '../utils/errors';
import { logger } from '../utils/logger';
import type { FileUpload } from '../types';

export class GalleryController {
  /**
   * Get all gallery images
   * GET /api/gallery/images
   */
  async getImages(req: Request, res: Response): Promise<void> {
    try {
      const {
        isActive,
        isFeatured,
        limit = '20',
        offset = '0'
      } = req.query;

      const options = {
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        isFeatured: isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined,
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10)
      };

      const result = await galleryService.getImages(options);

      res.status(200).json({
        success: true,
        message: 'Gallery images retrieved successfully',
        data: result.images,
        pagination: {
          total: result.total,
          limit: options.limit,
          offset: options.offset,
          hasMore: result.total > options.offset + options.limit
        }
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: error.message
        });
        return;
      }

      logger.error('Get gallery images controller error', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve gallery images'
      });
    }
  }

  /**
   * Get single gallery image
   * GET /api/gallery/images/:id
   */
  async getImageById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ValidationError('Image ID is required');
      }

      const image = await galleryService.getImageById(id);

      res.status(200).json({
        success: true,
        message: 'Gallery image retrieved successfully',
        data: image
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: error.message
        });
        return;
      }

      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: error.message
        });
        return;
      }

      logger.error('Get gallery image controller error', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve gallery image'
      });
    }
  }

  /**
   * Upload new gallery image
   * POST /api/gallery/images
   */
  async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Upload image request received', {
        hasFile: !!req.file,
        body: req.body,
        headers: req.headers['content-type']
      });

      if (!req.admin) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required'
        });
        return;
      }

      const file = req.file as FileUpload;
      if (!file) {
        logger.error('No file received in upload request');
        throw new ValidationError('Image file is required');
      }

      logger.info('File received', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });

      const {
        title,
        description,
        alt_text,
        display_order = 0,
        is_featured = true,
        is_active = true
      } = req.body;

      if (!title) {
        throw new ValidationError('Title is required');
      }

      const imageData = {
        title: title || 'Untitled',
        description: description || '',
        alt_text: alt_text || title || 'Gallery image',
        display_order: display_order ? parseInt(display_order, 10) : 0,
        is_featured: is_featured === 'true',
        is_active: is_active !== 'false',
        metadata: {}
      };

      logger.info('Processing image upload', { imageData });

      const image = await galleryService.uploadImage(file, imageData, req.admin.id);

      logger.info('Gallery image uploaded successfully', {
        imageId: image.id,
        title: image.title,
        adminId: req.admin.id
      });

      res.status(201).json({
        success: true,
        message: 'Gallery image uploaded successfully',
        data: image
      });
    } catch (error) {
      logger.error('Upload image error details', {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        hasFile: !!req.file,
        body: req.body
      });

      if (error instanceof ValidationError || error instanceof FileUploadError) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to upload gallery image'
      });
    }
  }

  /**
   * Update gallery image
   * PUT /api/gallery/images/:id
   */
  async updateImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required'
        });
        return;
      }

      const { id } = req.params;
      if (!id) {
        throw new ValidationError('Image ID is required');
      }

      const {
        title,
        description,
        alt_text,
        display_order,
        is_featured,
        is_active
      } = req.body;

      const updateData: any = {};

      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (alt_text !== undefined) updateData.alt_text = alt_text;
      if (display_order !== undefined) updateData.display_order = parseInt(display_order, 10);
      if (is_featured !== undefined) updateData.is_featured = is_featured === 'true';
      if (is_active !== undefined) updateData.is_active = is_active === 'true';

      if (Object.keys(updateData).length === 0) {
        throw new ValidationError('No valid fields to update');
      }

      const image = await galleryService.updateImage(id, updateData, req.admin.id);

      logger.info('Gallery image updated successfully', {
        imageId: id,
        adminId: req.admin.id
      });

      res.status(200).json({
        success: true,
        message: 'Gallery image updated successfully',
        data: image
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: error.message
        });
        return;
      }

      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: error.message
        });
        return;
      }

      logger.error('Update gallery image controller error', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update gallery image'
      });
    }
  }

  /**
   * Delete gallery image
   * DELETE /api/gallery/images/:id
   */
  async deleteImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required'
        });
        return;
      }

      const { id } = req.params;
      if (!id) {
        throw new ValidationError('Image ID is required');
      }

      await galleryService.deleteImage(id, req.admin.id);

      logger.info('Gallery image deleted successfully', {
        imageId: id,
        adminId: req.admin.id
      });

      res.status(200).json({
        success: true,
        message: 'Gallery image deleted successfully'
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: error.message
        });
        return;
      }

      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: error.message
        });
        return;
      }

      logger.error('Delete gallery image controller error', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to delete gallery image'
      });
    }
  }

  /**
   * Reorder gallery images
   * PUT /api/gallery/reorder
   */
  async reorderImages(req: Request, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required'
        });
        return;
      }

      const { imageOrders } = req.body;

      if (!Array.isArray(imageOrders)) {
        throw new ValidationError('imageOrders must be an array');
      }

      // Validate each order item
      for (const order of imageOrders) {
        if (!order.id || typeof order.display_order !== 'number') {
          throw new ValidationError('Each order item must have id and display_order');
        }
      }

      await galleryService.reorderImages(imageOrders);

      logger.info('Gallery images reordered successfully', {
        count: imageOrders.length,
        adminId: req.admin.id
      });

      res.status(200).json({
        success: true,
        message: 'Gallery images reordered successfully'
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: error.message
        });
        return;
      }

      logger.error('Reorder gallery images controller error', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to reorder gallery images'
      });
    }
  }

  /**
   * Get featured gallery images
   * GET /api/gallery/featured
   */
  async getFeaturedImages(req: Request, res: Response): Promise<void> {
    try {
      const { limit = '10' } = req.query;

      const result = await galleryService.getImages({
        isActive: true,
        isFeatured: true,
        limit: parseInt(limit as string, 10)
      });

      res.status(200).json({
        success: true,
        message: 'Featured gallery images retrieved successfully',
        data: result.images
      });
    } catch (error) {
      logger.error('Get featured gallery images controller error', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve featured gallery images'
      });
    }
  }
}

export const galleryController = new GalleryController();