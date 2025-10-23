import { useState, useEffect, useCallback } from 'react';
import { GalleryService } from '../services/galleryService';
import type { GalleryImage, ApiError } from '../types/api';

interface UseGalleryState {
  images: GalleryImage[];
  loading: boolean;
  error: ApiError | null;
  isOnline: boolean;
}

interface UseGalleryOptions {
  category?: string;
  featured?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useGallery = (options: UseGalleryOptions = {}) => {
  const [state, setState] = useState<UseGalleryState>({
    images: [],
    loading: true,
    error: null,
    isOnline: navigator.onLine,
  });

  const { category, featured, autoRefresh = false, refreshInterval = 30000 } = options;

  // Fetch images function
  const fetchImages = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      let images: GalleryImage[];
      
      if (featured) {
        images = await GalleryService.getFeaturedImages();
      } else if (category) {
        images = await GalleryService.getImagesByCategory(category);
      } else {
        images = await GalleryService.getAllImages();
      }

      // Transform images for display
      const transformedImages = GalleryService.transformImagesForDisplay(images);
      
      // Preload images for better UX
      GalleryService.preloadImages(images, 'medium');

      setState(prev => ({
        ...prev,
        images,
        loading: false,
        error: null,
      }));

      console.log(`✅ Loaded ${images.length} gallery images`);
      
    } catch (error) {
      console.error('❌ Failed to fetch gallery images:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as ApiError,
      }));

      // Use fallback images if API fails
      if (!navigator.onLine || (error as any)?.code === 'NETWORK_ERROR') {
        console.log('🔄 Using fallback images due to network issues');
        setState(prev => ({
          ...prev,
          images: getFallbackImages(),
          loading: false,
        }));
      }
    }
  }, [category, featured]);

  // Retry function
  const retry = useCallback(() => {
    fetchImages();
  }, [fetchImages]);

  // Refresh function
  const refresh = useCallback(() => {
    fetchImages();
  }, [fetchImages]);

  // Initial load
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (navigator.onLine && !state.loading) {
        fetchImages();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchImages, state.loading]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      if (state.error) {
        fetchImages();
      }
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchImages, state.error]);

  return {
    ...state,
    retry,
    refresh,
    fetchImages,
  };
};

// Fallback images for offline/error states
const getFallbackImages = (): GalleryImage[] => [
  {
    id: 'fallback-1',
    title: 'Michelin Star Cuisine',
    description: 'Exquisite culinary artistry that defines modern gastronomy',
    alt_text: 'Michelin Star Cuisine',
    category: 'Fine Dining',
    tags: ['fine-dining', 'michelin'],
    is_featured: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: [
      {
        id: 'v1',
        image_id: 'fallback-1',
        variant_type: 'medium',
        url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=1200&fit=crop&auto=format',
        width: 800,
        height: 1200,
        file_size: 150000,
        created_at: new Date().toISOString(),
      }
    ]
  },
  {
    id: 'fallback-2',
    title: 'Master Chef Portrait',
    description: 'The artisan behind extraordinary culinary experiences',
    alt_text: 'Master Chef Portrait',
    category: 'Chef',
    tags: ['chef', 'portrait'],
    is_featured: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: [
      {
        id: 'v2',
        image_id: 'fallback-2',
        variant_type: 'medium',
        url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=1200&fit=crop&auto=format',
        width: 800,
        height: 1200,
        file_size: 150000,
        created_at: new Date().toISOString(),
      }
    ]
  },
  {
    id: 'fallback-3',
    title: 'Elegant Dining Room',
    description: 'Sophisticated ambiance that complements exceptional cuisine',
    alt_text: 'Elegant Dining Room',
    category: 'Interior',
    tags: ['interior', 'dining'],
    is_featured: true,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: [
      {
        id: 'v3',
        image_id: 'fallback-3',
        variant_type: 'medium',
        url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=1200&fit=crop&auto=format',
        width: 800,
        height: 1200,
        file_size: 150000,
        created_at: new Date().toISOString(),
      }
    ]
  }
];

export default useGallery;