import { ApiService } from '../lib/api';
import type { 
  GalleryImage, 
  GalleryResponse, 
  GalleryParams,
  ApiError 
} from '../types/api';

export class GalleryService {
  /**
   * Fetch all gallery images with optional filtering
   */
  static async getAllImages(params?: GalleryParams): Promise<GalleryImage[]> {
    try {
      const response: GalleryResponse = await ApiService.getGalleryImages(params);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch gallery images');
    } catch (error) {
      console.error('GalleryService.getAllImages error:', error);
      throw error;
    }
  }

  /**
   * Fetch featured gallery images only
   */
  static async getFeaturedImages(): Promise<GalleryImage[]> {
    try {
      console.log('🔄 Fetching featured images from /gallery/featured');
      
      // Use the correct featured endpoint
      const response = await ApiService.getFeaturedImages();
      
      if (response.success && response.data) {
        console.log('✅ Featured images response:', response);
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch featured gallery images');
    } catch (error) {
      console.error('❌ GalleryService.getFeaturedImages error:', error);
      throw error;
    }
  }

  /**
   * Fetch images by category
   */
  static async getImagesByCategory(category: string): Promise<GalleryImage[]> {
    return this.getAllImages({ category });
  }

  /**
   * Fetch single gallery image by ID
   */
  static async getImageById(id: string): Promise<GalleryImage> {
    try {
      const response = await ApiService.getGalleryImage(id);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch gallery image');
    } catch (error) {
      console.error('GalleryService.getImageById error:', error);
      throw error;
    }
  }

  /**
   * Get optimized image URL based on variant type
   */
  static getOptimizedImageUrl(image: GalleryImage, variantType: string = 'medium'): string {
    console.log('🔍 getOptimizedImageUrl called:', {
      imageId: image.id,
      title: image.title,
      variantType,
      hasImageVariants: !!image.image_variants,
      hasVariants: !!image.variants,
      imageVariantsCount: image.image_variants?.length || 0,
      variantsCount: image.variants?.length || 0,
      hasOriginalUrl: !!image.original_url
    });

    // Use image_variants first (from backend), then fallback to variants
    const variants = image.image_variants || image.variants || [];
    
    console.log('🔍 Available variant types:', variants.map(v => v.variant_type));
    console.log('🔍 Looking for variant type:', variantType);

    if (!variants || variants.length === 0) {
      console.log('❌ No variants found for image:', image.id);
      // Fallback to original_url if no variants exist
      if (image.original_url) {
        console.log('✅ Using original_url as fallback:', image.original_url);
        return image.original_url;
      }
      console.log('❌ No original_url available either');
      return '';
    }

    // Find the requested variant type
    const requestedVariant = variants.find(v => {
      console.log('🔍 Comparing:', v.variant_type, '===', variantType, '?', v.variant_type === variantType);
      return v.variant_type === variantType;
    });
    
    if (requestedVariant?.url) {
      console.log('✅ Found requested variant:', {
        type: requestedVariant.variant_type,
        url: requestedVariant.url
      });
      return requestedVariant.url;
    }

    console.log('❌ Requested variant not found, trying fallbacks...');

    // Fallback priority: large -> webp -> thumbnail -> first available
    const fallbackOrder = ['large', 'webp', 'thumbnail'];
    
    for (const fallbackType of fallbackOrder) {
      const fallbackVariant = variants.find(v => v.variant_type === fallbackType);
      if (fallbackVariant?.url) {
        console.log('✅ Using fallback variant:', {
          requested: variantType,
          using: fallbackVariant.variant_type,
          url: fallbackVariant.url
        });
        return fallbackVariant.url;
      }
    }

    // Last resort: use first available variant
    const firstVariant = variants[0];
    if (firstVariant?.url) {
      console.log('✅ Using first available variant:', {
        type: firstVariant.variant_type,
        url: firstVariant.url
      });
      return firstVariant.url;
    }

    // Final fallback to original_url
    if (image.original_url) {
      console.log('✅ Using original_url as final fallback:', image.original_url);
      return image.original_url;
    }

    console.log('❌ No valid URL found in any variant or original_url for image:', image.id);
    return '';
  }

  /**
   * Get responsive image sources for different screen sizes
   */
  static getResponsiveImageSources(image: GalleryImage) {
    const variants = image.variants || [];
    
    return {
      thumbnail: variants.find(v => v.variant_type === 'thumbnail')?.url || '',
      medium: variants.find(v => v.variant_type === 'medium')?.url || '',
      large: variants.find(v => v.variant_type === 'large')?.url || '',
      original: variants.find(v => v.variant_type === 'original')?.url || '',
    };
  }

  /**
   * Transform gallery images for frontend consumption
   */
  static transformImagesForDisplay(images: GalleryImage[]) {
    return images.map(image => ({
      id: image.id,
      title: image.title,
      description: image.description || '',
      alt: image.alt_text || image.title,
      category: image.category || 'general',
      tags: image.tags || [],
      featured: image.is_featured,
      order: image.display_order,
      createdAt: new Date(image.created_at),
      updatedAt: new Date(image.updated_at),
      // Image URLs for different sizes
      urls: this.getResponsiveImageSources(image),
      // Primary URL (medium by default)
      url: this.getOptimizedImageUrl(image, 'medium'),
      // Thumbnail for previews
      thumbnail: this.getOptimizedImageUrl(image, 'thumbnail'),
      // High quality for lightbox
      highRes: this.getOptimizedImageUrl(image, 'large'),
    }));
  }

  /**
   * Preload images for better UX
   */
  static preloadImages(images: GalleryImage[], variantType: 'thumbnail' | 'medium' | 'large' = 'medium') {
    images.forEach(image => {
      const url = this.getOptimizedImageUrl(image, variantType);
      if (url) {
        const img = new Image();
        img.src = url;
      }
    });
  }
}

export default GalleryService;