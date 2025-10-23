// Admin Panel Types and Interfaces

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

// Gallery Management Types
export interface GalleryImage {
  id: string;
  title: string;
  description?: string;
  altText?: string;
  url: string;
  originalUrl?: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  size: number;
  fileSize?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  tags?: string[];
  sortOrder?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ImageMetadata {
  title: string;
  description?: string;
  altText?: string;
  tags?: string[];
}

export interface GalleryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
  sortBy?: 'createdAt' | 'title' | 'sortOrder';
  sortOrder?: 'asc' | 'desc';
}

export interface GalleryResponse {
  images: GalleryImage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Home Content Management Types
export interface HomeContent {
  id: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords?: string;
  isPublished: boolean;
  sections: HomeSection[];
  updatedAt: string;
}

export interface HomeContentUpdate {
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  isActive?: boolean;
}

export interface HomeSection {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  type: 'hero' | 'about' | 'services' | 'gallery' | 'contact' | 'custom';
  isVisible: boolean;
  order: number;
  settings?: {
    backgroundColor?: string;
    textColor?: string;
    backgroundImage?: string;
    layout?: 'default' | 'centered' | 'split' | 'full-width';
  };
  updatedAt: string;
}

// Media Library Types
export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  url: string;
  thumbnailUrl?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MediaQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  mimeType?: string;
  sortBy?: 'createdAt' | 'filename' | 'fileSize';
  sortOrder?: 'asc' | 'desc';
}

export interface MediaResponse {
  files: MediaFile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Upload Types
export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface BulkUploadResult {
  successful: GalleryImage[];
  failed: Array<{
    fileName: string;
    error: string;
  }>;
}

// Dashboard Types
export interface DashboardStats {
  totalImages: number;
  totalContent: number;
  totalStorage: number;
  recentUploads: number;
}

export interface RecentActivity {
  id: string;
  type: 'upload' | 'edit' | 'delete' | 'publish';
  description: string;
  timestamp: string;
  adminName: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
  systemHealth: {
    status: 'healthy' | 'warning' | 'error';
    message: string;
  };
}

// Form Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: ValidationError[];
}

// UI Component Types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'url';
  value?: string;
  onChange?: ((value: string) => void) | ((event: React.ChangeEvent<HTMLInputElement>) => void);
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  footer?: React.ReactNode;
}

export interface TableColumn<T> {
  key: keyof T;
  title: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T, index?: number) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  onRowClick?: (item: T) => void;
  selectedItems?: T[];
  onSelectionChange?: (items: T[]) => void;
}

// Route Types
export interface AdminRoute {
  path: string;
  component: React.ComponentType;
  title: string;
  icon?: React.ComponentType;
  requiredRole?: 'admin' | 'super_admin';
  showInSidebar?: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}