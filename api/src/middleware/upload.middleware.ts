import multer from 'multer';
import { Request } from 'express';
import { FileUploadError } from '../utils/errors';
import { config } from '../config';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  try {
    // Check file type
    const allowedMimeTypes = config.upload.allowedFileTypes;
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new FileUploadError(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`));
    }
  } catch (error) {
    cb(new FileUploadError('Error processing file filter'));
  }
};

// Configure multer with better error handling
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize, // 10MB default
    files: 1, // Single file upload
    fieldSize: 1024 * 1024, // 1MB field size limit
    fieldNameSize: 100, // Field name size limit
    fields: 10 // Max number of non-file fields
  }
});

// Single image upload middleware
export const uploadSingle = upload.single('image');

// Multiple images upload middleware (max 10 files)
export const uploadMultiple = upload.array('images', 10);

// Error handling middleware for multer
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File Too Large',
        message: `File size exceeds maximum limit of ${config.upload.maxFileSize / 1024 / 1024}MB`
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too Many Files',
        message: 'Maximum 10 files allowed'
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected Field',
        message: 'Unexpected file field'
      });
    }
  }
  
  if (error instanceof FileUploadError) {
    return res.status(400).json({
      success: false,
      error: 'File Upload Error',
      message: error.message
    });
  }
  
  next(error);
};