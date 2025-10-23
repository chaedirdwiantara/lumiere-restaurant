import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

export interface ValidatedRequest<T = any> extends Request {
  validatedData: T;
}

/**
 * Middleware to validate request body using Zod schema
 */
export const validateBody = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      (req as ValidatedRequest<T>).validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        logger.warn('Validation error in request body', {
          errors: errorMessages,
          body: req.body,
          url: req.url,
          method: req.method
        });
        
        throw new ValidationError('Invalid request body', errorMessages);
      }
      next(error);
    }
  };
};

/**
 * Middleware to validate request query parameters using Zod schema
 */
export const validateQuery = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.query);
      (req as ValidatedRequest<T>).validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        logger.warn('Validation error in query parameters', {
          errors: errorMessages,
          query: req.query,
          url: req.url,
          method: req.method
        });
        
        throw new ValidationError('Invalid query parameters', errorMessages);
      }
      next(error);
    }
  };
};

/**
 * Middleware to validate request parameters using Zod schema
 */
export const validateParams = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.params);
      (req as ValidatedRequest<T>).validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        logger.warn('Validation error in request parameters', {
          errors: errorMessages,
          params: req.params,
          url: req.url,
          method: req.method
        });
        
        throw new ValidationError('Invalid request parameters', errorMessages);
      }
      next(error);
    }
  };
};

/**
 * Middleware to validate multiple parts of the request
 */
export const validate = <TBody = any, TQuery = any, TParams = any>(options: {
  body?: z.ZodSchema<TBody>;
  query?: z.ZodSchema<TQuery>;
  params?: z.ZodSchema<TParams>;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData: any = {};
      
      if (options.body) {
        validatedData.body = options.body.parse(req.body);
      }
      
      if (options.query) {
        validatedData.query = options.query.parse(req.query);
      }
      
      if (options.params) {
        validatedData.params = options.params.parse(req.params);
      }
      
      (req as any).validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        logger.warn('Validation error in request', {
          errors: errorMessages,
          body: req.body,
          query: req.query,
          params: req.params,
          url: req.url,
          method: req.method
        });
        
        throw new ValidationError('Invalid request data', errorMessages);
      }
      next(error);
    }
  };
};

/**
 * Middleware to sanitize and validate file upload metadata
 */
export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file && !req.files) {
      throw new ValidationError('No file uploaded');
    }
    
    const file = req.file || (Array.isArray(req.files) ? req.files[0] : req.files);
    
    if (!file) {
      throw new ValidationError('No valid file found in request');
    }
    
    // Validate file size (already handled by multer, but double-check)
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB default
    if (file.size > maxSize) {
      throw new ValidationError(`File size exceeds maximum allowed size of ${maxSize} bytes`);
    }
    
    // Validate file type
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(',');
    if (!allowedTypes.includes(file.mimetype)) {
      throw new ValidationError(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
    
    logger.info('File upload validation passed', {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    next();
  } catch (error) {
    next(error);
  }
};