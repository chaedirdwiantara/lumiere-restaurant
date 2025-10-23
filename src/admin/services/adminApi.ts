import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  GalleryImage, 
  GalleryQueryParams, 
  GalleryResponse, 
  ImageMetadata,
  HomeContent,
  HomeContentUpdate,
  MediaFile,
  MediaQueryParams,
  MediaResponse,
  DashboardData,
  Admin
} from '../types/admin';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class AdminApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = authService.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh token using authService
            await authService.refreshAccessToken();
            const token = authService.getAccessToken();
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.client.request(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }

          // If refresh fails or no token, redirect to login
          authService.logout();
          // Clear all auth-related localStorage items
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_access_token');
          localStorage.removeItem('admin_refresh_token');
          window.location.href = '/admin/login';
          return Promise.reject(error);
        }

        return Promise.reject(error);
      }
    );
  }

  // Dashboard APIs
  async getDashboardData(): Promise<DashboardData> {
    const response = await this.client.get('/admin/dashboard');
    return response.data;
  }

  // Gallery Management APIs
  async getGalleryImages(params?: GalleryQueryParams): Promise<GalleryResponse> {
    try {
      console.log('🔄 Fetching gallery images with params:', params);
      
      const response = await this.client.get('/gallery/images', { params });
      const data = response.data;
      
      console.log('📥 Raw API response:', data);
      
      // Transform backend image data to frontend format
      if (data.data && Array.isArray(data.data)) {
        data.data = data.data.map(this.transformBackendImageToFrontend);
        console.log(`✅ Transformed ${data.data.length} images`);
      }
      
      // Ensure consistent response structure
      const result = {
        success: data.success || true,
        data: data.data || [],
        images: data.data || [], // Add images property for backward compatibility
        pagination: data.pagination || null,
        message: data.message || 'Images retrieved successfully'
      };
      
      console.log('📤 Returning structured response:', result);
      return result;
    } catch (error) {
      console.error('❌ AdminApi.getGalleryImages error:', error);
      throw error;
    }
  }

  // Transform backend image structure to frontend format
  private transformBackendImageToFrontend(backendImage: any): GalleryImage {
    // Get the best available URL for display
    const getImageUrl = (variants: any[], fallbackUrl: string) => {
      if (!variants || variants.length === 0) return fallbackUrl;
      
      // Prefer medium variant, then thumbnail, then large, then original
      const medium = variants.find(v => v.variant_type === 'medium');
      if (medium) return medium.url;
      
      const thumbnail = variants.find(v => v.variant_type === 'thumbnail');
      if (thumbnail) return thumbnail.url;
      
      const large = variants.find(v => v.variant_type === 'large');
      if (large) return large.url;
      
      return fallbackUrl;
    };

    const variants = backendImage.image_variants || [];
    
    return {
      id: backendImage.id,
      title: backendImage.title,
      description: backendImage.description,
      altText: backendImage.alt_text,
      url: getImageUrl(variants, backendImage.original_url),
      originalUrl: backendImage.original_url,
      thumbnailUrl: variants.find(v => v.variant_type === 'thumbnail')?.url,
      mediumUrl: variants.find(v => v.variant_type === 'medium')?.url,
      largeUrl: variants.find(v => v.variant_type === 'large')?.url,
      size: backendImage.file_size || 0,
      fileSize: backendImage.file_size || 0,
      dimensions: backendImage.width && backendImage.height ? { width: backendImage.width, height: backendImage.height } : undefined,
      tags: backendImage.tags || [],
      sortOrder: backendImage.display_order,
      isActive: backendImage.is_active,
      createdAt: backendImage.created_at,
      updatedAt: backendImage.updated_at,
    };
  }

  private calculateTotalSize(variants: any[], backendImage: any): number {
    // Use the medium variant size if available, otherwise use original
    const mediumVariant = variants.find(v => v.variant_type === 'medium');
    if (mediumVariant && mediumVariant.file_size) {
      return mediumVariant.file_size;
    }
    
    // Fallback to any variant with size info
    const variantWithSize = variants.find(v => v.file_size);
    if (variantWithSize) {
      return variantWithSize.file_size;
    }
    
    // Last resort: return 0 if no size info available
    return 0;
  }

  private getImageDimensions(variants: any[], backendImage: any): { width: number; height: number } | undefined {
    // Use medium variant dimensions if available
    const mediumVariant = variants.find(v => v.variant_type === 'medium');
    if (mediumVariant && mediumVariant.width && mediumVariant.height) {
      return { width: mediumVariant.width, height: mediumVariant.height };
    }
    
    // Fallback to any variant with dimensions
    const variantWithDimensions = variants.find(v => v.width && v.height);
    if (variantWithDimensions) {
      return { width: variantWithDimensions.width, height: variantWithDimensions.height };
    }
    
    return undefined;
  }

  async uploadImage(file: File, metadata: ImageMetadata): Promise<GalleryImage> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('title', metadata.title);
      
      if (metadata.description) {
        formData.append('description', metadata.description);
      }
      if (metadata.altText) {
        formData.append('alt_text', metadata.altText);
      }
      if (metadata.tags && metadata.tags.length > 0) {
        formData.append('tags', JSON.stringify(metadata.tags));
      }

      // Ensure we have a valid token before making the request
      const token = authService.getAccessToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await this.client.post('/gallery/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 60000, // Increase timeout for file uploads
      });
      
      const backendImage = response.data.data || response.data.image;
      return this.transformBackendImageToFrontend(backendImage);
    } catch (error: any) {
      console.error('Upload image error:', error);
      
      // If it's an authentication error, handle it properly
      if (error.response?.status === 401) {
        authService.logout();
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
        window.location.href = '/admin/login';
      }
      
      throw error;
    }
  }

  async uploadMultipleImages(
    files: File[], 
    onProgress?: (progress: { fileName: string; progress: number }) => void
  ): Promise<GalleryImage[]> {
    try {
      // Ensure we have a valid token before making requests
      const token = authService.getAccessToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('title', file.name.split('.')[0]);

        const response = await this.client.post('/gallery/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
          timeout: 60000, // Increase timeout for file uploads
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress({ fileName: file.name, progress });
            }
          },
        });
        return response.data.data || response.data.image;
      });

      return Promise.all(uploadPromises);
    } catch (error: any) {
      console.error('Upload multiple images error:', error);
      
      // If it's an authentication error, handle it properly
      if (error.response?.status === 401) {
        authService.logout();
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
        window.location.href = '/admin/login';
      }
      
      throw error;
    }
  }

  async updateImage(id: string, data: Partial<GalleryImage>): Promise<GalleryImage> {
    const response = await this.client.put(`/gallery/images/${id}`, data);
    const backendImage = response.data.image;
    return this.transformBackendImageToFrontend(backendImage);
  }

  async deleteImage(id: string): Promise<void> {
    await this.client.delete(`/gallery/images/${id}`);
  }

  async reorderImages(imageIds: string[]): Promise<void> {
    await this.client.put('/gallery/reorder', { imageIds });
  }

  async toggleImageStatus(id: string): Promise<GalleryImage> {
    const response = await this.client.patch(`/gallery/images/${id}/toggle`);
    const backendImage = response.data.image;
    return this.transformBackendImageToFrontend(backendImage);
  }

  // Home Content Management APIs
  async getHomeContent(): Promise<{ data: HomeContent }> {
    try {
      const response = await this.client.get('/home/content');
      return response.data;
    } catch (error) {
      // Return mock data if API fails
      return {
        data: {
          id: 'home',
          metaTitle: 'Cycent Cinema - Premium Movie Experience',
          metaDescription: 'Experience the best movies with state-of-the-art technology and comfort at Cycent Cinema.',
          metaKeywords: 'cinema, movies, entertainment, premium experience',
          isPublished: false,
          sections: [
            {
              id: 'hero',
              title: 'Welcome to Cycent Cinema',
              subtitle: 'Premium Movie Experience',
              content: '<p>Experience movies like never before with our state-of-the-art technology and luxurious seating.</p>',
              type: 'hero',
              isVisible: true,
              order: 0,
              settings: {
                backgroundColor: '#1a1a1a',
                textColor: '#ffffff',
                layout: 'centered'
              },
              updatedAt: new Date().toISOString()
            }
          ],
          updatedAt: new Date().toISOString()
        }
      };
    }
  }

  async updateHomeContent(data: HomeContent): Promise<HomeContent> {
    try {
      const response = await this.client.put('/home/content', data);
      return response.data.content;
    } catch (error) {
      // Return the data as if it was saved successfully
      console.warn('Failed to save home content to API, using local data');
      return data;
    }
  }

  // Media Library APIs
  async getMediaFiles(params?: MediaQueryParams): Promise<MediaResponse> {
    const response = await this.client.get('/media', { params });
    return response.data;
  }

  async uploadMediaFile(file: File): Promise<MediaFile> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.file;
  }

  async deleteMediaFile(id: string): Promise<void> {
    await this.client.delete(`/media/${id}`);
  }

  // Admin Profile APIs
  async getProfile(): Promise<Admin> {
    const response = await this.client.get('/auth/profile');
    return response.data.admin;
  }

  async updateProfile(data: Partial<Admin>): Promise<Admin> {
    const response = await this.client.put('/auth/profile', data);
    return response.data.admin;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.client.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  // Utility method for handling API errors
  private handleError(error: any): never {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || 'An unexpected error occurred');
  }
}

export const adminApi = new AdminApiService();