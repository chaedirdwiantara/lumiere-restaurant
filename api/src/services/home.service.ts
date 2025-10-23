import { supabaseService } from '../config/database';
import { ValidationError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';
import type { HomeContent } from '../types';

export class HomeService {
  /**
   * Get all home content sections
   */
  async getAllContent(): Promise<HomeContent[]> {
    try {
      const { data: content, error } = await supabaseService
        .from('home_content')
        .select('*')
        .eq('is_active', true)
        .order('section_key', { ascending: true });

      if (error) {
        logger.error('Error fetching home content', error);
        throw new ValidationError('Failed to fetch home content');
      }

      return content || [];
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      logger.error('Home service error', error);
      throw new ValidationError('Failed to fetch home content');
    }
  }

  /**
   * Get home content by section key
   */
  async getContentBySection(sectionKey: string): Promise<HomeContent> {
    try {
      const { data: content, error } = await supabaseService
        .from('home_content')
        .select('*')
        .eq('section_key', sectionKey)
        .eq('is_active', true)
        .single();

      if (error || !content) {
        throw new NotFoundError(`Home content section '${sectionKey}' not found`);
      }

      return content;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error('Error fetching home content by section', error);
      throw new ValidationError('Failed to fetch home content section');
    }
  }

  /**
   * Update home content section
   */
  async updateContent(
    sectionKey: string,
    updateData: Partial<Omit<HomeContent, 'id' | 'section_key' | 'created_at' | 'updated_at'>>,
    adminId: string
  ): Promise<HomeContent> {
    try {
      // Check if section exists
      await this.getContentBySection(sectionKey);

      // Add updated_by to update data
      const dataWithUpdater = {
        ...updateData,
        updated_by: adminId
      };

      const { data: updatedContent, error } = await supabaseService
        .from('home_content')
        .update(dataWithUpdater)
        .eq('section_key', sectionKey)
        .select()
        .single();

      if (error || !updatedContent) {
        throw new ValidationError('Failed to update home content');
      }

      logger.info('Home content updated successfully', {
        sectionKey,
        adminId
      });

      return updatedContent;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      logger.error('Home content update error', error);
      throw new ValidationError('Failed to update home content');
    }
  }

  /**
   * Create new home content section
   */
  async createContent(
    contentData: Omit<HomeContent, 'id' | 'created_at' | 'updated_at'>,
    adminId: string
  ): Promise<HomeContent> {
    try {
      // Check if section already exists
      try {
        await this.getContentBySection(contentData.section_key);
        throw new ValidationError(`Home content section '${contentData.section_key}' already exists`);
      } catch (error) {
        if (!(error instanceof NotFoundError)) {
          throw error;
        }
        // Section doesn't exist, continue with creation
      }

      // Add updated_by to content data
      const dataWithUpdater = {
        ...contentData,
        updated_by: adminId
      };

      const { data: newContent, error } = await supabaseService
        .from('home_content')
        .insert(dataWithUpdater)
        .select()
        .single();

      if (error || !newContent) {
        throw new ValidationError('Failed to create home content');
      }

      logger.info('Home content created successfully', {
        sectionKey: newContent.section_key,
        adminId
      });

      return newContent;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      logger.error('Home content creation error', error);
      throw new ValidationError('Failed to create home content');
    }
  }

  /**
   * Delete home content section
   */
  async deleteContentBySection(sectionKey: string, adminId: string): Promise<void> {
    try {
      // Check if section exists
      await this.getContentBySection(sectionKey);

      const { error } = await supabaseService
        .from('home_content')
        .delete()
        .eq('section_key', sectionKey);

      if (error) {
        throw new ValidationError('Failed to delete home content');
      }

      logger.info('Home content deleted successfully', {
        sectionKey,
        adminId
      });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      logger.error('Home content deletion error', error);
      throw new ValidationError('Failed to delete home content');
    }
  }

  /**
   * Toggle home content section active status
   */
  async toggleActiveStatus(sectionKey: string, adminId: string): Promise<HomeContent> {
    try {
      // Get current content
      const currentContent = await this.getContentBySection(sectionKey);

      // Toggle active status
      const { data: updatedContent, error } = await supabaseService
        .from('home_content')
        .update({
          is_active: !currentContent.is_active,
          updated_by: adminId
        })
        .eq('section_key', sectionKey)
        .select()
        .single();

      if (error || !updatedContent) {
        throw new ValidationError('Failed to toggle home content status');
      }

      logger.info('Home content status toggled successfully', {
        sectionKey,
        newStatus: updatedContent.is_active,
        adminId
      });

      return updatedContent;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      logger.error('Home content status toggle error', error);
      throw new ValidationError('Failed to toggle home content status');
    }
  }

  /**
   * Get hero section content (convenience method)
   */
  async getHeroContent(): Promise<HomeContent> {
    return this.getContentBySection('hero');
  }

  /**
   * Update hero section content (convenience method)
   */
  async updateHeroContent(
    updateData: Partial<Omit<HomeContent, 'id' | 'section_key' | 'created_at' | 'updated_at'>>,
    adminId: string
  ): Promise<HomeContent> {
    return this.updateContent('hero', updateData, adminId);
  }

  /**
   * Get about section content (convenience method)
   */
  async getAboutContent(): Promise<HomeContent> {
    return this.getContentBySection('about');
  }

  /**
   * Update about section content (convenience method)
   */
  async updateAboutContent(
    updateData: Partial<Omit<HomeContent, 'id' | 'section_key' | 'created_at' | 'updated_at'>>,
    adminId: string
  ): Promise<HomeContent> {
    return this.updateContent('about', updateData, adminId);
  }

  /**
   * Get features section content (convenience method)
   */
  async getFeaturesContent(): Promise<HomeContent> {
    return this.getContentBySection('features');
  }

  /**
   * Update features section content (convenience method)
   */
  async updateFeaturesContent(
    updateData: Partial<Omit<HomeContent, 'id' | 'section_key' | 'created_at' | 'updated_at'>>,
    adminId: string
  ): Promise<HomeContent> {
    return this.updateContent('features', updateData, adminId);
  }
}

export const homeService = new HomeService();