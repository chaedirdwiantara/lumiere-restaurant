import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { 
  GalleryImage, 
  GalleryQueryParams, 
  ImageMetadata 
} from '../types/admin';
import { adminApi } from '../services/adminApi';
import { 
  Button, 
  Input, 
  Modal, 
  Card, 
  LoadingSpinner,
  Badge 
} from '../components/ui';
import ImageUpload from '../components/gallery/ImageUpload';
import ImageGrid from '../components/gallery/ImageGrid';

const imageMetadataSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  altText: z.string().optional(),
  tags: z.string().optional(),
});

type ImageMetadataForm = z.infer<typeof imageMetadataSchema>;

const Gallery: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<GalleryQueryParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ImageMetadataForm>({
    resolver: zodResolver(imageMetadataSchema),
  });

  useEffect(() => {
    loadImages();
  }, [filters]);

  const loadImages = async () => {
    try {
      setLoading(true);
      console.log('Loading images with filters:', { ...filters, search: searchQuery });
      
      const response = await adminApi.getGalleryImages({
        ...filters,
        search: searchQuery || undefined,
      });
      
      console.log('API Response:', response);
      
      // Check if response has the correct structure
      if (response && response.data && Array.isArray(response.data)) {
        setImages(response.data);
        console.log(`✅ Loaded ${response.data.length} images from API`);
      } else if (response && response.images && Array.isArray(response.images)) {
        setImages(response.images);
        console.log(`✅ Loaded ${response.images.length} images from API`);
      } else {
        console.warn('⚠️ Unexpected API response structure:', response);
        setImages([]);
      }
    } catch (error) {
      console.error('❌ Failed to load images:', error);
      
      // Show error to user instead of fallback mock data
      setImages([]);
      
      // You can add a toast notification here if you have one
      // toast.error('Failed to load gallery images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files: File[]) => {
    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const metadata: ImageMetadata = {
          title: file.name.split('.')[0],
          description: '',
          altText: '',
          tags: [],
        };
        return adminApi.uploadImage(file, metadata);
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setImages(prev => [...(uploadedImages || []), ...(prev || [])]);
      setShowUploadModal(false);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (image: GalleryImage) => {
    setEditingImage(image);
    setValue('title', image.title);
    setValue('description', image.description || '');
    setValue('altText', image.altText || '');
    setValue('tags', image.tags?.join(', ') || '');
    setShowEditModal(true);
  };

  const handleUpdateImage = async (data: ImageMetadataForm) => {
    if (!editingImage) return;

    try {
      const updatedImage = await adminApi.updateImage(editingImage.id, {
        title: data.title,
        description: data.description,
        altText: data.altText,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
      });

      setImages(prev => 
        (prev || []).map(img => img.id === editingImage.id ? updatedImage : img)
      );
      setShowEditModal(false);
      setEditingImage(null);
      reset();
    } catch (error) {
      console.error('Failed to update image:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteImage(id);
      setImages(prev => (prev || []).filter(img => img.id !== id));
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const updatedImage = await adminApi.toggleImageStatus(id);
      setImages(prev => 
        (prev || []).map(img => img.id === id ? updatedImage : img)
      );
    } catch (error) {
      console.error('Failed to toggle image status:', error);
      // Fallback: toggle locally
      setImages(prev => 
        (prev || []).map(img => 
          img.id === id ? { ...img, isActive: !img.isActive } : img
        )
      );
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, page: 1 }));
    loadImages();
  };

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc',
      page: 1,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gallery Management</h1>
          <p className="text-gray-400 mt-1">
            Manage your image gallery and media files
          </p>
        </div>
        <Button
          onClick={() => setShowUploadModal(true)}
          variant="primary"
          className="flex items-center space-x-2"
        >
          <ArrowUpTrayIcon className="w-5 h-5" />
          <span>Upload Images</span>
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Sort and Filter Controls */}
          <div className="flex items-center space-x-4">
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="createdAt">Date Created</option>
              <option value="title">Title</option>
              <option value="size">File Size</option>
            </select>

            <Badge variant="info">
              {images?.length || 0} image{(images?.length || 0) !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Image Grid */}
      <ImageGrid
        images={images}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        selectable={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Images"
        size="lg"
      >
        <ImageUpload
          onUpload={handleUpload}
          multiple={true}
          maxFiles={10}
          disabled={uploading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingImage(null);
          reset();
        }}
        title="Edit Image"
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setShowEditModal(false);
                setEditingImage(null);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit(handleUpdateImage)}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(handleUpdateImage)} className="space-y-4">
          {editingImage && (
            <div className="mb-4">
              <img
                src={editingImage.url || editingImage.originalUrl || editingImage.thumbnailUrl}
                alt={editingImage.altText || editingImage.title}
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  // Fallback to other URL variants if main URL fails
                  const target = e.target as HTMLImageElement;
                  if (editingImage.originalUrl && target.src !== editingImage.originalUrl) {
                    target.src = editingImage.originalUrl;
                  } else if (editingImage.largeUrl && target.src !== editingImage.largeUrl) {
                    target.src = editingImage.largeUrl;
                  }
                }}
              />
            </div>
          )}

          <Input
            {...register('title')}
            label="Title"
            placeholder="Enter image title"
            error={errors.title?.message}
            required
          />

          <Input
            {...register('description')}
            label="Description"
            placeholder="Enter image description"
            error={errors.description?.message}
          />

          <Input
            {...register('altText')}
            label="Alt Text"
            placeholder="Enter alt text for accessibility"
            error={errors.altText?.message}
          />

          <Input
            {...register('tags')}
            label="Tags"
            placeholder="Enter tags separated by commas"
            error={errors.tags?.message}
            helperText="Separate multiple tags with commas"
          />
        </form>
      </Modal>
    </div>
  );
};

export default Gallery;