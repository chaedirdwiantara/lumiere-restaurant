import { AppError } from '../types';

export class CustomError extends Error implements AppError {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes
export class ValidationError extends CustomError {
  constructor(message: string, details?: string | ValidationErrorDetail[]) {
    const code = typeof details === 'string' ? details : 'VALIDATION_ERROR';
    super(message, 400, true, code);
    if (Array.isArray(details)) {
      this.details = details;
    }
  }
  public readonly details?: ValidationErrorDetail[];
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export class AuthenticationError extends CustomError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, true, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string = 'Access denied') {
    super(message, 403, true, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, true, 'NOT_FOUND_ERROR');
  }
}

export class ConflictError extends CustomError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, true, 'CONFLICT_ERROR');
  }
}

export class DatabaseError extends CustomError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, true, 'DATABASE_ERROR');
  }
}

export class FileUploadError extends CustomError {
  constructor(message: string = 'File upload failed') {
    super(message, 400, true, 'FILE_UPLOAD_ERROR');
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, true, 'RATE_LIMIT_ERROR');
  }
}

// Error factory functions
export const createValidationError = (field: string, message: string): ValidationError => {
  return new ValidationError(`${field}: ${message}`, 'FIELD_VALIDATION_ERROR');
};

export const createNotFoundError = (resource: string, id?: string): NotFoundError => {
  const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
  return new NotFoundError(message);
};

export const createConflictError = (resource: string, field: string, value: string): ConflictError => {
  return new ConflictError(`${resource} with ${field} '${value}' already exists`);
};

// Error type guards
export const isOperationalError = (error: Error): boolean => {
  if (error instanceof CustomError) {
    return error.isOperational;
  }
  return false;
};

export const getErrorStatusCode = (error: Error): number => {
  if (error instanceof CustomError) {
    return error.statusCode;
  }
  return 500;
};

export const getErrorCode = (error: Error): string => {
  if (error instanceof CustomError && error.code) {
    return error.code;
  }
  return 'INTERNAL_SERVER_ERROR';
};