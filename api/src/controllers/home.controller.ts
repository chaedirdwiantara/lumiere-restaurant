import { Request, Response } from 'express';
import { homeService } from '../services/home.service';
import { ValidationError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

export class HomeController {
  /**
   * Get all home content sections
   * GET /api/home/content
   */
  async getAllContent(req: Request, res: Response): Promise<void> {
    try {
      const content = await homeService.getAllContent();

      res.status(200).json({
        success: true,
        message: 'Home content retrieved successfully',
        data: content
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

      logger.error('Get all home content controller error', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve home content'
      });
    }
  }

  /**
   * Get home content by section
   * GET /api/home/content/:section
   */
  async getContentBySection(req: Request, res: Response): Promise<void> {
    try {
      const { section } = req.params;

      if (!section) {
        throw new ValidationError('Section key is required');
      }

      const content = await homeService.getContentBySection(section);

      res.status(200).json({
        success: true,
        message: 'Home content section retrieved successfully',
        data: content
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

      logger.error('Get home content by section controller error', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve home content section'
      });
    }
  }

  /**
   * Update home content section
   * PUT /api/home/content/:section
   */
  async updateContent(req: Request, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required'
        });
        return;
      }

      const { section } = req.params;
      if (!section) {
        throw new ValidationError('Section key is required');
      }

      const {
        title,
        subtitle,
        description,
        image_url,
        button_text,
        button_url,
        metadata,
        is_active
      } = req.body;

      const updateData: any = {};

      if (title !== undefined) updateData.title = title;
      if (subtitle !== undefined) updateData.subtitle = subtitle;
      if (description !== undefined) updateData.description = description;
      if (image_url !== undefined) updateData.image_url = image_url;
      if (button_text !== undefined) updateData.button_text = button_text;
      if (button_url !== undefined) updateData.button_url = button_url;
      if (metadata !== undefined) updateData.metadata = metadata;
      if (is_active !== undefined) updateData.is_active = is_active;

      if (Object.keys(updateData).length === 0) {
        throw new ValidationError('No valid fields to update');
      }

      const content = await homeService.updateContent(section, updateData, req.admin.id);

      logger.info('Home content updated successfully', {
        section,
        adminId: req.admin.id
      });

      res.status(200).json({
        success: true,
        message: 'Home content updated successfully',
        data: content
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

      logger.error('Update home content controller error', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update home content'
      });
    }
  }

  /**
   * Create new home content section
   * POST /api/home/content
   */
  async createContent(req: Request, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required'
        });
        return;
      }

      const {
        section_key,
        title,
        subtitle,
        description,
        image_url,
        button_text,
        button_url,
        metadata = {},
        is_active = true
      } = req.body;

      if (!section_key) {
        throw new ValidationError('Section key is required');
      }

      const contentData = {
        section_key,
        title: title || null,
        subtitle: subtitle || null,
        description: description || null,
        image_url: image_url || null,
        button_text: button_text || null,
        button_url: button_url || null,
        metadata,
        is_active
      };

      const content = await homeService.createContent(contentData, req.admin.id);

      logger.info('Home content created successfully', {
        sectionKey: section_key,
        adminId: req.admin.id
      });

      res.status(201).json({
        success: true,
        message: 'Home content created successfully',
        data: content
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

      logger.error('Create home content controller error', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to create home content'
      });
    }
  }

  /**
   * Delete home content section
   * DELETE /api/home/content/:section
   */
  async deleteContent(req: Request, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required'
        });
        return;
      }

      const { section } = req.params;
      if (!section) {
        throw new ValidationError('Section key is required');
      }

      await homeService.deleteContent(section, req.admin.id);

      logger.info('Home content deleted successfully', {
        section,
        adminId: req.admin.id
      });

      res.status(200).json({
        success: true,
        message: 'Home content deleted successfully'
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

      logger.error('Delete home content controller error', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to delete home content'
      });
    }
  }

  /**
   * Toggle home content section active status
   * PATCH /api/home/content/:section/toggle
   */
  async toggleActiveStatus(req: Request, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required'
        });
        return;
      }

      const { section } = req.params;
      if (!section) {
        throw new ValidationError('Section key is required');
      }

      const content = await homeService.toggleActiveStatus(section, req.admin.id);

      logger.info('Home content status toggled successfully', {
        section,
        newStatus: content.is_active,
        adminId: req.admin.id
      });

      res.status(200).json({
        success: true,
        message: 'Home content status toggled successfully',
        data: content
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

      logger.error('Toggle home content status controller error', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to toggle home content status'
      });
    }
  }

  /**
   * Get hero section content
   * GET /api/home/hero
   */
  async getHeroContent(req: Request, res: Response): Promise<void> {
    try {
      const content = await homeService.getHeroContent();

      res.status(200).json({
        success: true,
        message: 'Hero content retrieved successfully',
        data: content
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: error.message
        });
        return;
      }

      logger.error('Get hero content controller error', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve hero content'
      });
    }
  }

  /**
   * Update hero section content
   * PUT /api/home/hero
   */
  async updateHeroContent(req: Request, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required'
        });
        return;
      }

      const {
        title,
        subtitle,
        description,
        image_url,
        button_text,
        button_url,
        metadata
      } = req.body;

      const updateData: any = {};

      if (title !== undefined) updateData.title = title;
      if (subtitle !== undefined) updateData.subtitle = subtitle;
      if (description !== undefined) updateData.description = description;
      if (image_url !== undefined) updateData.image_url = image_url;
      if (button_text !== undefined) updateData.button_text = button_text;
      if (button_url !== undefined) updateData.button_url = button_url;
      if (metadata !== undefined) updateData.metadata = metadata;

      if (Object.keys(updateData).length === 0) {
        throw new ValidationError('No valid fields to update');
      }

      const content = await homeService.updateHeroContent(updateData, req.admin.id);

      logger.info('Hero content updated successfully', {
        adminId: req.admin.id
      });

      res.status(200).json({
        success: true,
        message: 'Hero content updated successfully',
        data: content
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

      logger.error('Update hero content controller error', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update hero content'
      });
    }
  }
}

export const homeController = new HomeController();