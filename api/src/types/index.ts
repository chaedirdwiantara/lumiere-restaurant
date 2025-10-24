import { Request } from 'express';

// Admin Types
export interface Admin {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'super_admin';
  created_at: Date;
  updated_at: Date;
}

export interface AdminCreateInput {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'super_admin';
}

export interface AdminLoginInput {
  email: string;
  password: string;
}

// Gallery Types
export interface GalleryImage {
  id: string;
  title?: string;
  description?: string;
  alt_text?: string;
  original_url: string;
  optimized_url?: string;
  thumbnail_url?: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  display_order: number;
  is_featured: boolean;
  uploaded_by?: string;
  image_variants?: ImageVariant[];
  created_at: Date;
  updated_at: Date;
}

export interface GalleryImageCreateInput {
  title?: string;
  description?: string;
  alt_text?: string;
  original_url: string;
  optimized_url?: string;
  thumbnail_url?: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  display_order?: number;
  is_featured?: boolean;
  uploaded_by?: string;
}

export interface GalleryImageUpdateInput {
  title?: string;
  description?: string;
  alt_text?: string;
  display_order?: number;
  is_featured?: boolean;
}

// Image Variant Types
export interface ImageVariant {
  id: string;
  image_id: string;
  variant_type: 'thumbnail' | 'medium' | 'large' | 'webp';
  url: string;
  width?: number;
  height?: number;
  file_size?: number;
  size?: number;
  format?: string;
  buffer?: Buffer;
  created_at: Date;
}

// Home Content Types
export interface HomeContent {
  id: string;
  section_key: string;
  title?: string;
  subtitle?: string;
  content?: string;
  image_url?: string;
  button_text?: string;
  button_url?: string;
  metadata?: Record<string, any>;
  is_active: boolean;
  display_order: number;
  hero_title?: string;
  hero_subtitle?: string;
  hero_image_url?: string;
  featured_content?: FeaturedContent[];
  seo_meta?: SEOMeta;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface FeaturedContent {
  id?: string;
  title: string;
  description: string;
  image_url?: string;
  link_url?: string;
  order?: number;
}

export interface SEOMeta {
  title?: string;
  description?: string;
  keywords?: string[];
  og_title?: string;
  og_description?: string;
  og_image?: string;
}

export interface HomeContentUpdateInput {
  hero_title?: string;
  hero_subtitle?: string;
  hero_image_url?: string;
  featured_content?: FeaturedContent[];
  seo_meta?: SEOMeta;
}

// JWT Types
export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Request Types
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// File Upload Types
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface ProcessedImage {
  original: {
    url: string;
    width: number;
    height: number;
    size: number;
    format: string;
    buffer: Buffer;
  };
  variants: Record<string, {
    buffer: Buffer;
    width: number;
    height: number;
    size: number;
    format: string;
    url?: string;
  }> | ImageVariant[];
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;
}

// Database Query Types
export interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

// Supabase Types
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

export interface StorageUploadResult {
  path: string;
  fullPath: string;
  publicUrl: string;
}