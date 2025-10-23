import axios from 'axios';
import { Admin, LoginCredentials, AuthTokens } from '../types/admin';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Initialize tokens from localStorage
    this.reloadTokensFromStorage();
  }

  // Method to reload tokens from localStorage
  reloadTokensFromStorage(): void {
    this.accessToken = localStorage.getItem('admin_access_token');
    this.refreshToken = localStorage.getItem('admin_refresh_token');
    console.log('🔥 AuthService: Tokens reloaded from storage - access token available:', !!this.accessToken);
  }

  async login(credentials: LoginCredentials): Promise<{ admin: Admin; tokens: AuthTokens }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      const { admin, accessToken, refreshToken, expiresIn } = response.data;

      const tokens: AuthTokens = {
        accessToken,
        refreshToken,
        expiresIn
      };

      this.setTokens(accessToken, refreshToken);
      
      return { admin, tokens };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async refreshAccessToken(): Promise<AuthTokens> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken: this.refreshToken
      });

      const { data } = response.data;
      const { accessToken, refreshToken, expiresIn } = data;
      
      this.setTokens(accessToken, refreshToken);

      return {
        accessToken,
        refreshToken,
        expiresIn
      };
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  }

  async getProfile(): Promise<Admin> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      });

      return response.data.admin;
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Try to refresh token
        await this.refreshAccessToken();
        return this.getProfile();
      }
      throw new Error(error.response?.data?.message || 'Failed to get profile');
    }
  }

  logout(): void {
    console.log('AuthService: Logging out and clearing all tokens');
    this.clearTokens();
  }

  getAccessToken(): string | null {
    // Always check localStorage for the latest token
    if (!this.accessToken) {
      this.reloadTokensFromStorage();
    }
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    // Always check localStorage for the latest token
    if (!this.refreshToken) {
      this.reloadTokensFromStorage();
    }
    return this.refreshToken;
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token;
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    
    localStorage.setItem('admin_access_token', accessToken);
    localStorage.setItem('admin_refresh_token', refreshToken);
    console.log('🔥 AuthService: Tokens set - access token available:', !!accessToken);
  }

  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_token'); // Also clear legacy token
  }

  // Check if token is expired (basic check)
  isTokenExpired(): boolean {
    if (!this.accessToken) return true;
    
    try {
      const payload = JSON.parse(atob(this.accessToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }
}

export const authService = new AuthService();