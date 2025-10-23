import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuthenticationError, AuthorizationError } from '../utils/errors';
import { logger } from '../utils/logger';
import type { Admin } from '../types';

// Extend Express Request type to include admin
declare global {
  namespace Express {
    interface Request {
      admin?: Admin;
    }
  }
}

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches admin data to request
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new AuthenticationError('Access token required');
    }

    // Verify token and get admin data
    const admin = await authService.verifyToken(token);
    req.admin = admin;

    logger.debug('Token authenticated successfully', { 
      adminId: admin.id,
      email: admin.email,
      path: req.path 
    });

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: error.message
      });
      return;
    }

    logger.error('Authentication middleware error', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Authentication failed'
    });
  }
};

/**
 * Role-based Authorization Middleware
 * Checks if authenticated admin has required role
 */
export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.admin) {
        throw new AuthenticationError('Authentication required');
      }

      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      if (!allowedRoles.includes(req.admin.role)) {
        throw new AuthorizationError(`Access denied. Required role: ${allowedRoles.join(' or ')}`);
      }

      logger.debug('Role authorization successful', { 
        adminId: req.admin.id,
        role: req.admin.role,
        requiredRoles: allowedRoles,
        path: req.path 
      });

      next();
    } catch (error) {
      if (error instanceof AuthenticationError) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: error.message
        });
        return;
      }

      if (error instanceof AuthorizationError) {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: error.message
        });
        return;
      }

      logger.error('Authorization middleware error', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Authorization failed'
      });
    }
  };
};

/**
 * Admin Role Middleware (shorthand for requireRole('admin'))
 */
export const requireAdmin = requireRole('admin');

/**
 * Optional Authentication Middleware
 * Attaches admin data if token is present, but doesn't require it
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const admin = await authService.verifyToken(token);
        req.admin = admin;
        
        logger.debug('Optional auth successful', { 
          adminId: admin.id,
          path: req.path 
        });
      } catch (error) {
        // Ignore token errors for optional auth
        logger.debug('Optional auth token invalid', { path: req.path });
      }
    }

    next();
  } catch (error) {
    logger.error('Optional auth middleware error', error);
    next(); // Continue without authentication
  }
};

/**
 * Rate Limiting Middleware for Authentication Routes
 */
export const authRateLimit = (maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    
    // Clean up expired entries
    for (const [key, value] of attempts.entries()) {
      if (now > value.resetTime) {
        attempts.delete(key);
      }
    }

    const clientAttempts = attempts.get(clientId);
    
    if (!clientAttempts) {
      attempts.set(clientId, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    if (clientAttempts.count >= maxAttempts) {
      const remainingTime = Math.ceil((clientAttempts.resetTime - now) / 1000 / 60);
      
      logger.warn('Rate limit exceeded for authentication', { 
        clientId, 
        attempts: clientAttempts.count,
        remainingTime 
      });

      res.status(429).json({
        success: false,
        error: 'Too Many Requests',
        message: `Too many authentication attempts. Try again in ${remainingTime} minutes.`,
        retryAfter: remainingTime * 60
      });
      return;
    }

    clientAttempts.count++;
    next();
  };
};