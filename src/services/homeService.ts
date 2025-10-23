import { ApiService } from '../lib/api';
import type { 
  HomeContent, 
  HomeContentResponse, 
  HomeContentParams,
  ApiError 
} from '../types/api';

export class HomeService {
  /**
   * Fetch all home content sections
   */
  static async getAllContent(params?: HomeContentParams): Promise<HomeContent[]> {
    try {
      const response: HomeContentResponse = await ApiService.getHomeContent(params);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch home content');
    } catch (error) {
      console.error('HomeService.getAllContent error:', error);
      throw error;
    }
  }

  /**
   * Fetch active home content only
   */
  static async getActiveContent(): Promise<HomeContent[]> {
    return this.getAllContent({ active: true });
  }

  /**
   * Fetch content by specific section
   */
  static async getContentBySection(section: string): Promise<HomeContent> {
    try {
      const response = await ApiService.getHomeContentBySection(section);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || `Failed to fetch ${section} content`);
    } catch (error) {
      console.error('HomeService.getContentBySection error:', error);
      throw error;
    }
  }

  /**
   * Get hero section content
   */
  static async getHeroContent(): Promise<HomeContent | null> {
    try {
      return await this.getContentBySection('hero');
    } catch (error) {
      console.error('Failed to fetch hero content:', error);
      return null;
    }
  }

  /**
   * Get about section content
   */
  static async getAboutContent(): Promise<HomeContent | null> {
    try {
      return await this.getContentBySection('about');
    } catch (error) {
      console.error('Failed to fetch about content:', error);
      return null;
    }
  }

  /**
   * Get features section content
   */
  static async getFeaturesContent(): Promise<HomeContent[]> {
    try {
      const allContent = await this.getActiveContent();
      return allContent.filter(content => content.section === 'features')
                     .sort((a, b) => a.display_order - b.display_order);
    } catch (error) {
      console.error('Failed to fetch features content:', error);
      return [];
    }
  }

  /**
   * Get testimonials section content
   */
  static async getTestimonialsContent(): Promise<HomeContent[]> {
    try {
      const allContent = await this.getActiveContent();
      return allContent.filter(content => content.section === 'testimonials')
                     .sort((a, b) => a.display_order - b.display_order);
    } catch (error) {
      console.error('Failed to fetch testimonials content:', error);
      return [];
    }
  }

  /**
   * Get CTA section content
   */
  static async getCtaContent(): Promise<HomeContent | null> {
    try {
      return await this.getContentBySection('cta');
    } catch (error) {
      console.error('Failed to fetch CTA content:', error);
      return null;
    }
  }

  /**
   * Transform home content for frontend consumption
   */
  static transformContentForDisplay(content: HomeContent[]) {
    return content.map(item => ({
      id: item.id,
      section: item.section,
      title: item.title || '',
      subtitle: item.subtitle || '',
      content: item.content || '',
      imageUrl: item.image_url || '',
      buttonText: item.button_text || '',
      buttonUrl: item.button_url || '',
      metadata: item.metadata || {},
      isActive: item.is_active,
      order: item.display_order,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
    }));
  }

  /**
   * Get content organized by sections
   */
  static async getContentBySections(): Promise<Record<string, HomeContent[]>> {
    try {
      const allContent = await this.getActiveContent();
      const contentBySections: Record<string, HomeContent[]> = {};

      allContent.forEach(content => {
        if (!contentBySections[content.section]) {
          contentBySections[content.section] = [];
        }
        contentBySections[content.section].push(content);
      });

      // Sort each section by display_order
      Object.keys(contentBySections).forEach(section => {
        contentBySections[section].sort((a, b) => a.display_order - b.display_order);
      });

      return contentBySections;
    } catch (error) {
      console.error('HomeService.getContentBySections error:', error);
      return {};
    }
  }

  /**
   * Preload images from home content
   */
  static preloadContentImages(content: HomeContent[]) {
    content.forEach(item => {
      if (item.image_url) {
        const img = new Image();
        img.src = item.image_url;
      }
    });
  }

  /**
   * Get fallback content for offline/error states
   */
  static getFallbackContent(): Record<string, Partial<HomeContent>> {
    return {
      hero: {
        section: 'hero',
        title: 'Cycent Cinema',
        subtitle: 'Experience Cinema Like Never Before',
        content: 'Immerse yourself in the world of premium entertainment with our state-of-the-art facilities and exceptional service.',
        button_text: 'Explore Gallery',
        button_url: '/gallery',
        is_active: true,
        display_order: 1,
      },
      about: {
        section: 'about',
        title: 'About Cycent Cinema',
        content: 'We are dedicated to providing an unparalleled cinematic experience with cutting-edge technology and luxurious comfort.',
        is_active: true,
        display_order: 1,
      },
      cta: {
        section: 'cta',
        title: 'Ready to Experience?',
        subtitle: 'Join us for an unforgettable journey',
        button_text: 'Book Now',
        button_url: '/booking',
        is_active: true,
        display_order: 1,
      },
    };
  }
}

export default HomeService;