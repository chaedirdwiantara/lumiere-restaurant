import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button, LoadingSpinner } from '../ui';

interface ImageUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: string[];
  disabled?: boolean;
}

interface FileWithPreview extends File {
  preview: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  multiple = true,
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = ['image/jpeg', 'image/png', 'image/webp'],
  disabled = false,
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const filesWithPreview = acceptedFiles.map(file => 
      Object.assign(file, {
        preview: URL.createObjectURL(file)
      })
    );
    
    setFiles(prev => [...prev, ...filesWithPreview]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    maxFiles: multiple ? maxFiles : 1,
    multiple,
    disabled: disabled || uploading,
  });

  const removeFile = (fileToRemove: FileWithPreview) => {
    setFiles(files => files.filter(file => file !== fileToRemove));
    URL.revokeObjectURL(fileToRemove.preview);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      await onUpload(files);
      // Clear files after successful upload
      files.forEach(file => URL.revokeObjectURL(file.preview));
      setFiles([]);
      setUploadProgress({});
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-amber-500 bg-amber-500/10' 
            : 'border-gray-600 hover:border-gray-500'
          }
          ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        
        {isDragActive ? (
          <p className="text-amber-400 font-medium">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-white font-medium mb-2">
              Drag & drop images here, or click to select
            </p>
            <p className="text-gray-400 text-sm">
              {multiple ? `Up to ${maxFiles} files` : 'Single file'} • 
              Max {formatFileSize(maxSize)} each • 
              {accept.map(type => type.split('/')[1]).join(', ').toUpperCase()}
            </p>
          </div>
        )}
      </div>

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4">
          <h4 className="text-red-200 font-medium mb-2">Some files were rejected:</h4>
          <ul className="text-red-300 text-sm space-y-1">
            {fileRejections.map(({ file, errors }) => (
              <li key={file.name}>
                {file.name}: {errors.map(e => e.message).join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* File Preview */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-white font-medium">Selected Files ({files.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  {uploadProgress[file.name] && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center">
                        <LoadingSpinner size="sm" />
                        <p className="text-white text-xs mt-2">
                          {uploadProgress[file.name]}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => removeFile(file)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={uploading}
                >
                  <XMarkIcon className="w-4 h-4 text-white" />
                </button>
                
                <div className="mt-2">
                  <p className="text-white text-xs truncate">{file.name}</p>
                  <p className="text-gray-400 text-xs">{formatFileSize(file.size)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleUpload}
              loading={uploading}
              disabled={uploading || files.length === 0}
              variant="primary"
            >
              {uploading ? 'Uploading...' : `Upload ${files.length} file${files.length > 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;