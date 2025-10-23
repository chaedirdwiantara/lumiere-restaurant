import React, { useState } from 'react';
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowsUpDownIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { GalleryImage } from '../../types/admin';
import { Badge, Button, Modal } from '../ui';

interface ImageGridProps {
  images: GalleryImage[];
  loading?: boolean;
  onEdit: (image: GalleryImage) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onReorder?: (imageIds: string[]) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  loading = false,
  onEdit,
  onDelete,
  onToggleStatus,
  onReorder,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
}) => {
  const [previewImage, setPreviewImage] = useState<GalleryImage | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleSelectImage = (imageId: string) => {
    if (!selectable || !onSelectionChange) return;

    const newSelection = selectedIds.includes(imageId)
      ? selectedIds.filter(id => id !== imageId)
      : [...selectedIds, imageId];
    
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (!selectable || !onSelectionChange) return;
    
    if (selectedIds.length === images.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(images.map(img => img.id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(10)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-square bg-gray-800 rounded-lg"></div>
            <div className="mt-2 space-y-2">
              <div className="h-4 bg-gray-800 rounded"></div>
              <div className="h-3 bg-gray-800 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
          <EyeIcon className="w-12 h-12 text-gray-600" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No images found</h3>
        <p className="text-gray-400">Upload some images to get started.</p>
      </div>
    );
  }

  return (
    <>
      {/* Selection Controls */}
      {selectable && (
        <div className="flex items-center justify-between mb-4 p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSelectAll}
              className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white"
            >
              <div className={`w-4 h-4 border-2 rounded ${
                selectedIds.length === images.length 
                  ? 'bg-amber-500 border-amber-500' 
                  : 'border-gray-500'
              } flex items-center justify-center`}>
                {selectedIds.length === images.length && (
                  <CheckIcon className="w-3 h-3 text-white" />
                )}
              </div>
              <span>Select All ({selectedIds.length}/{images.length})</span>
            </button>
          </div>
          
          {selectedIds.length > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="info">{selectedIds.length} selected</Badge>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  // Handle bulk delete
                  console.log('Bulk delete:', selectedIds);
                }}
              >
                Delete Selected
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {images.map((image) => (
          <div key={image.id} className="group relative">
            {/* Selection Checkbox */}
            {selectable && (
              <div className="absolute top-2 left-2 z-10">
                <button
                  onClick={() => handleSelectImage(image.id)}
                  className={`w-5 h-5 border-2 rounded ${
                    selectedIds.includes(image.id)
                      ? 'bg-amber-500 border-amber-500'
                      : 'bg-black/50 border-white/50 hover:border-white'
                  } flex items-center justify-center transition-all`}
                >
                  {selectedIds.includes(image.id) && (
                    <CheckIcon className="w-3 h-3 text-white" />
                  )}
                </button>
              </div>
            )}

            {/* Image */}
            <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={image.url || image.thumbnailUrl || image.mediumUrl || image.originalUrl}
                alt={image.altText || image.title}
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => setPreviewImage(image)}
                onError={(e) => {
                  // Fallback to other URL variants if main URL fails
                  const target = e.target as HTMLImageElement;
                  if (image.thumbnailUrl && target.src !== image.thumbnailUrl) {
                    target.src = image.thumbnailUrl;
                  } else if (image.mediumUrl && target.src !== image.mediumUrl) {
                    target.src = image.mediumUrl;
                  } else if (image.originalUrl && target.src !== image.originalUrl) {
                    target.src = image.originalUrl;
                  }
                }}
              />
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                <button
                  onClick={() => setPreviewImage(image)}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                  title="Preview"
                >
                  <EyeIcon className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => onEdit(image)}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                  title="Edit"
                >
                  <PencilIcon className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(image.id)}
                  className="p-2 bg-red-600/80 rounded-full hover:bg-red-600 transition-colors"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Image Info */}
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-white truncate">
                  {image.title}
                </h4>
                <Badge 
                  variant={image.isActive ? 'success' : 'default'}
                  size="sm"
                >
                  {image.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{formatFileSize(image.size || 0)}</span>
                <span>{formatDate(image.createdAt)}</span>
              </div>
              
              {image.tags && image.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {image.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="default" size="sm">
                      {tag}
                    </Badge>
                  ))}
                  {image.tags.length > 2 && (
                    <Badge variant="default" size="sm">
                      +{image.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Status Toggle */}
            <button
              onClick={() => onToggleStatus(image.id)}
              className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                image.isActive 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
              title={image.isActive ? 'Deactivate' : 'Activate'}
            >
              <div className={`w-2 h-2 rounded-full ${
                image.isActive ? 'bg-white' : 'bg-gray-400'
              }`} />
            </button>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewImage && (
        <Modal
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
          title={previewImage.title}
          size="xl"
        >
          <div className="space-y-4">
            <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={previewImage.largeUrl || previewImage.url || previewImage.mediumUrl || previewImage.originalUrl}
                alt={previewImage.altText || previewImage.title}
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback to other URL variants if main URL fails
                  const target = e.target as HTMLImageElement;
                  if (previewImage.originalUrl && target.src !== previewImage.originalUrl) {
                    target.src = previewImage.originalUrl;
                  } else if (previewImage.mediumUrl && target.src !== previewImage.mediumUrl) {
                    target.src = previewImage.mediumUrl;
                  } else if (previewImage.url && target.src !== previewImage.url) {
                    target.src = previewImage.url;
                  }
                }}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Description</p>
                <p className="text-white">{previewImage.description || 'No description'}</p>
              </div>
              <div>
                <p className="text-gray-400">Alt Text</p>
                <p className="text-white">{previewImage.altText || 'No alt text'}</p>
              </div>
              <div>
                <p className="text-gray-400">Size</p>
                <p className="text-white">{formatFileSize(previewImage.size || 0)}</p>
              </div>
              <div>
                <p className="text-gray-400">Created</p>
                <p className="text-white">{formatDate(previewImage.createdAt)}</p>
              </div>
            </div>

            {previewImage.tags && previewImage.tags.length > 0 && (
              <div>
                <p className="text-gray-400 text-sm mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {previewImage.tags.map((tag, index) => (
                    <Badge key={index} variant="default">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Delete Image"
          size="sm"
          footer={
            <>
              <Button
                variant="ghost"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  onDelete(deleteConfirm);
                  setDeleteConfirm(null);
                }}
              >
                Delete
              </Button>
            </>
          }
        >
          <p className="text-gray-300">
            Are you sure you want to delete this image? This action cannot be undone.
          </p>
        </Modal>
      )}
    </>
  );
};

export default ImageGrid;