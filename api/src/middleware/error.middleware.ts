import { Request, Response, NextFunction } from 'express';
import { 
  ValidationError, 
  AuthenticationError, 
  AuthorizationError, 
  NotFoundError, 
  ConflictError, 
  FileUploadError,
  DatabaseError,
  ExternalServiceError 
} from '../utils/errors';
import { logger } from '../utils/logger';

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
    timestamp: string;
    path: string;
    method: string;
  };
}

/**
 * Global error handling middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const timestamp = new Date().toISOString();
  const path = req.originalUrl;
  const method = req.method;

  // Log error details
  logger.error('Error occurred', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    request: {
      method,
      path,
      body: req.body,
      query: req.query,
      params: req.params,
      headers: {
        'user-agent': req.get('user-agent'),
        'content-type': req.get('content-type'),
        'authorization': req.get('authorization') ? '[REDACTED]' : undefined
      }
    }
  });

  let statusCode = 500;
  let errorResponse: ErrorResponse = {
    success: false,
    error: {
      message: 'Internal server error',
      timestamp,
      path,
      method
    }
  };

  // Handle specific error types
  if (error instanceof ValidationError) {
    statusCode = 400;
    errorResponse.error = {
      message: error.message,
      code: 'VALIDATION_ERROR',
      details: error.details,
      timestamp,
      path,
      method
    };
  } else if (error instanceof AuthenticationError) {
    statusCode = 401;
    errorResponse.error = {
      message: error.message,
      code: 'AUTHENTICATION_ERROR',
      timestamp,
      path,
      method
    };
  } else if (error instanceof AuthorizationError) {
    statusCode = 403;
    errorResponse.error = {
      message: error.message,
      code: 'AUTHORIZATION_ERROR',
      timestamp,
      path,
      method
    };
  } else if (error instanceof NotFoundError) {
    statusCode = 404;
    errorResponse.error = {
      message: error.message,
      code: 'NOT_FOUND_ERROR',
      timestamp,
      path,
      method
    };
  } else if (error instanceof ConflictError) {
    statusCode = 409;
    errorResponse.error = {
      message: error.message,
      code: 'CONFLICT_ERROR',
      details: error.details,
      timestamp,
      path,
      method
    };
  } else if (error instanceof FileUploadError) {
    statusCode = 400;
    errorResponse.error = {
      message: error.message,
      code: 'FILE_UPLOAD_ERROR',
      details: error.details,
      timestamp,
      path,
      method
    };
  } else if (error instanceof DatabaseError) {
    statusCode = 500;
    errorResponse.error = {
      message: 'Database operation failed',
      code: 'DATABASE_ERROR',
      timestamp,
      path,
      method
    };
  } else if (error instanceof ExternalServiceError) {
    statusCode = 502;
    errorResponse.error = {
      message: 'External service error',
      code: 'EXTERNAL_SERVICE_ERROR',
      timestamp,
      path,
      method
    };
  } else if (error.name === 'MulterError') {
    statusCode = 400;
    let message = 'File upload error';
    
    switch ((error as any).code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File size exceeds the maximum allowed limit';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files uploaded';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        break;
      case 'LIMIT_PART_COUNT':
        message = 'Too many parts in multipart form';
        break;
      case 'LIMIT_FIELD_KEY':
        message = 'Field name too long';
        break;
      case 'LIMIT_FIELD_VALUE':
        message = 'Field value too long';
        break;
      case 'LIMIT_FIELD_COUNT':
        message = 'Too many fields';
        break;
      case 'MISSING_FIELD_NAME':
        message = 'Field name missing';
        break;
      default:
        message = error.message;
    }
    
    errorResponse.error = {
      message,
      code: 'FILE_UPLOAD_ERROR',
      timestamp,
      path,
      method
    };
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorResponse.error = {
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
      timestamp,
      path,
      method
    };
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    errorResponse.error = {
      message: 'Token expired',
      code: 'TOKEN_EXPIRED',
      timestamp,
      path,
      method
    };
  } else if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
    statusCode = 400;
    errorResponse.error = {
      message: 'Invalid JSON in request body',
      code: 'INVALID_JSON',
      timestamp,
      path,
      method
    };
  }

  // Don't expose internal error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    errorResponse.error.message = 'Internal server error';
    delete errorResponse.error.details;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Middleware to handle 404 errors for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`);
  next(error);
};

/**
 * Async error wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};