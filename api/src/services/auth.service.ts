import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabaseService } from '../config/database';
import { config } from '../config';
import { AuthenticationError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';
import type { Admin, LoginCredentials, AuthTokens, JWTPayload } from '../types';

export class AuthService {
  private readonly saltRounds = 12;

  /**
   * Authenticate admin user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    try {
      const { email, password } = credentials;

      // Find admin by email
      const { data: admin, error } = await supabaseService
        .from('admins')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error || !admin) {
        logger.warn('Login attempt with invalid email', { email });
        throw new AuthenticationError('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
      if (!isPasswordValid) {
        logger.warn('Login attempt with invalid password', { email });
        throw new AuthenticationError('Invalid credentials');
      }

      // Update last login
      await supabaseService
        .from('admins')
        .update({ last_login: new Date().toISOString() })
        .eq('id', admin.id);

      // Generate tokens
      const tokens = this.generateTokens(admin);

      logger.info('Admin login successful', { 
        adminId: admin.id, 
        email: admin.email 
      });

      return tokens;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      logger.error('Login error', error);
      throw new AuthenticationError('Authentication failed');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = jwt.verify(refreshToken, config.jwt.refreshSecret) as JWTPayload;
      
      // Verify admin still exists and is active
      const { data: admin, error } = await supabaseService
        .from('admins')
        .select('*')
        .eq('id', payload.adminId)
        .eq('is_active', true)
        .single();

      if (error || !admin) {
        throw new AuthenticationError('Invalid refresh token');
      }

      // Generate new tokens
      return this.generateTokens(admin);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid refresh token');
      }
      logger.error('Token refresh error', error);
      throw new AuthenticationError('Token refresh failed');
    }
  }

  /**
   * Verify access token and return admin data
   */
  async verifyToken(token: string): Promise<Admin> {
    try {
      const payload = jwt.verify(token, config.jwt.secret) as JWTPayload;
      
      // Get fresh admin data
      const { data: admin, error } = await supabaseService
        .from('admins')
        .select('*')
        .eq('id', payload.adminId)
        .eq('is_active', true)
        .single();

      if (error || !admin) {
        throw new AuthenticationError('Invalid token');
      }

      return admin;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Create new admin user (for setup/management)
   */
  async createAdmin(adminData: Omit<Admin, 'id' | 'created_at' | 'updated_at' | 'last_login'>): Promise<Admin> {
    try {
      // Check if email already exists
      const { data: existingAdmin } = await supabaseService
        .from('admins')
        .select('id')
        .eq('email', adminData.email)
        .single();

      if (existingAdmin) {
        throw new ValidationError('Email already exists');
      }

      // Hash password
      const password_hash = await bcrypt.hash(adminData.password_hash, this.saltRounds);

      // Create admin
      const { data: admin, error } = await supabaseService
        .from('admins')
        .insert({
          ...adminData,
          password_hash
        })
        .select()
        .single();

      if (error) {
        logger.error('Admin creation error', error);
        throw new ValidationError('Failed to create admin');
      }

      logger.info('Admin created successfully', { 
        adminId: admin.id, 
        email: admin.email 
      });

      return admin;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      logger.error('Admin creation error', error);
      throw new ValidationError('Failed to create admin');
    }
  }

  /**
   * Change admin password
   */
  async changePassword(adminId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Get current admin
      const { data: admin, error } = await supabaseService
        .from('admins')
        .select('password_hash')
        .eq('id', adminId)
        .single();

      if (error || !admin) {
        throw new AuthenticationError('Admin not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password_hash);
      if (!isCurrentPasswordValid) {
        throw new AuthenticationError('Current password is incorrect');
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, this.saltRounds);

      // Update password
      const { error: updateError } = await supabaseService
        .from('admins')
        .update({ password_hash: newPasswordHash })
        .eq('id', adminId);

      if (updateError) {
        throw new ValidationError('Failed to update password');
      }

      logger.info('Password changed successfully', { adminId });
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof ValidationError) {
        throw error;
      }
      logger.error('Password change error', error);
      throw new ValidationError('Failed to change password');
    }
  }

  /**
   * Generate JWT tokens for admin
   */
  private generateTokens(admin: Admin): AuthTokens {
    const payload: JWTPayload = {
      adminId: admin.id,
      email: admin.email,
      role: admin.role
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: config.jwt.expiresIn,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    };
  }
}

export const authService = new AuthService();