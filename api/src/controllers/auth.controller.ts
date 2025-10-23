import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { ValidationError, AuthenticationError } from '../utils/errors';
import { logger } from '../utils/logger';
import type { LoginCredentials } from '../types';

export class AuthController {
  /**
   * Admin login endpoint
   * POST /api/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginCredentials = req.body;

      // Basic validation
      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      // Authenticate admin
      const tokens = await authService.login({ email, password });

      logger.info('Admin login successful', { 
        email,
        adminId: tokens.admin.id 
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: tokens
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: error.message
        });
        return;
      }

      if (error instanceof AuthenticationError) {
        res.status(401).json({
          success: false,
          error: 'Authentication Error',
          message: error.message
        });
        return;
      }

      logger.error('Login controller error', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Login failed'
      });
    }
  }

  /**
   * Refresh token endpoint
   * POST /api/auth/refresh
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new ValidationError('Refresh token is required');
      }

      // Refresh tokens
      const tokens = await authService.refreshToken(refreshToken);

      logger.info('Token refresh successful', { 
        adminId: tokens.admin.id 
      });

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: tokens
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: error.message
        });
        return;
      }

      if (error instanceof AuthenticationError) {
        res.status(401).json({
          success: false,
          error: 'Authentication Error',
          message: error.message
        });
        return;
      }

      logger.error('Token refresh controller error', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Token refresh failed'
      });
    }
  }

  /**
   * Get current admin profile
   * GET /api/auth/profile
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        throw new AuthenticationError('Authentication required');
      }

      const { password_hash, ...adminProfile } = req.admin;

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: adminProfile
      });
    } catch (error) {
      if (error instanceof AuthenticationError) {
        res.status(401).json({
          success: false,
          error: 'Authentication Error',
          message: error.message
        });
        return;
      }

      logger.error('Get profile controller error', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve profile'
      });
    }
  }

  /**
   * Change password endpoint
   * PUT /api/auth/password
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        throw new AuthenticationError('Authentication required');
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        throw new ValidationError('Current password and new password are required');
      }

      if (newPassword.length < 8) {
        throw new ValidationError('New password must be at least 8 characters long');
      }

      // Change password
      await authService.changePassword(req.admin.id, currentPassword, newPassword);

      logger.info('Password changed successfully', { 
        adminId: req.admin.id 
      });

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: error.message
        });
        return;
      }

      if (error instanceof AuthenticationError) {
        res.status(401).json({
          success: false,
          error: 'Authentication Error',
          message: error.message
        });
        return;
      }

      logger.error('Change password controller error', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to change password'
      });
    }
  }

  /**
   * Logout endpoint (client-side token invalidation)
   * POST /api/auth/logout
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // In a JWT-based system, logout is typically handled client-side
      // by removing the token. We can log the event for audit purposes.
      
      if (req.admin) {
        logger.info('Admin logout', { 
          adminId: req.admin.id,
          email: req.admin.email 
        });
      }

      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      logger.error('Logout controller error', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Logout failed'
      });
    }
  }

  /**
   * Verify token endpoint
   * GET /api/auth/verify
   */
  async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        throw new AuthenticationError('Invalid token');
      }

      const { password_hash, ...adminData } = req.admin;

      res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: {
          valid: true,
          admin: adminData
        }
      });
    } catch (error) {
      if (error instanceof AuthenticationError) {
        res.status(401).json({
          success: false,
          error: 'Authentication Error',
          message: error.message,
          data: {
            valid: false
          }
        });
        return;
      }

      logger.error('Verify token controller error', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Token verification failed',
        data: {
          valid: false
        }
      });
    }
  }
}

export const authController = new AuthController();