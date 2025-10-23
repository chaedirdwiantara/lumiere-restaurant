import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { 
  ApiResponse, 
  ApiError,
  GalleryResponse,
  HomeContentResponse,
  GalleryParams,
  HomeContentParams 
} from '../types/api';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    console.error('❌ Response Error:', error.response?.status, error.message);
    
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login if needed
      localStorage.removeItem('auth_token');
    }
    
    return Promise.reject(error);
  }
);

// Error handler utility
const handleApiError = (error: any): ApiError => {
  if (error.response?.data?.message) {
    return {
      message: error.response.data.message,
      code: error.response.data.code,
      details: error.response.data.details,
    };
  }
  
  if (error.message) {
    return {
      message: error.message,
      code: error.code,
    };
  }
  
  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  };
};

// API Service Class
export class ApiService {
  // Health check
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await apiClient.get('/health');
      return response.data.success === true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Gallery API methods
  static async getGalleryImages(params?: GalleryParams): Promise<GalleryResponse> {
    try {
      const response = await apiClient.get('/gallery/images', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async getGalleryImage(id: string) {
    try {
      const response = await apiClient.get(`/gallery/images/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Get featured gallery images
  static async getFeaturedImages(): Promise<GalleryResponse> {
    try {
      const response = await apiClient.get('/gallery/featured');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Home Content API methods
  static async getHomeContent(params?: HomeContentParams): Promise<HomeContentResponse> {
    try {
      const response = await apiClient.get('/home/content', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async getHomeContentBySection(section: string) {
    try {
      const response = await apiClient.get(`/home/content/${section}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Export axios instance for direct use if needed
export { apiClient };

// Export default
export default ApiService;