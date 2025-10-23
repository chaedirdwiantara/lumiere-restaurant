// API Types untuk Frontend Integration
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  description?: string;
  alt_text?: string;
  category?: string;
  tags?: string[];
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  // Backend returns image_variants, but we also support variants for compatibility
  image_variants?: ImageVariant[];
  variants?: ImageVariant[];
  // Original URL fallback when no variants exist
  original_url?: string;
}

export interface ImageVariant {
  id: string;
  image_id: string;
  variant_type: 'thumbnail' | 'medium' | 'large' | 'original';
  url: string;
  width: number;
  height: number;
  file_size: number;
  created_at: string;
}

export interface HomeContent {
  id: string;
  section: 'hero' | 'about' | 'features' | 'testimonials' | 'cta';
  title?: string;
  subtitle?: string;
  content?: string;
  image_url?: string;
  button_text?: string;
  button_url?: string;
  metadata?: Record<string, any>;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface GalleryParams extends PaginationParams {
  category?: string;
  featured?: boolean;
  tags?: string[];
}

export interface HomeContentParams {
  section?: string;
  active?: boolean;
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error: ApiError | null;
}

// API Service Response Types
export interface GalleryResponse extends ApiResponse<GalleryImage[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface HomeContentResponse extends ApiResponse<HomeContent[]> {}

export interface SingleGalleryImageResponse extends ApiResponse<GalleryImage> {}

export interface SingleHomeContentResponse extends ApiResponse<HomeContent> {}