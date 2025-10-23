import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with true to check existing session

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    
    try {
      console.log('🔥 AuthContext: Starting login with:', credentials.email);
      
      // Call backend API
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      console.log('🔥 AuthContext: Login response:', data);

      // Check if response has the expected structure
      if (!data.success || !data.data) {
        throw new Error('Invalid response structure');
      }

      // Set admin data - fix structure based on actual response
      const adminData: Admin = {
        id: data.data.admin?.id || '',
        email: data.data.admin?.email || '',
        name: data.data.admin?.name || 'Admin',
        role: data.data.admin?.role || 'admin'
      };

      // Validate that we have required admin data
      if (!adminData.id || !adminData.email) {
        throw new Error('Invalid admin data received');
      }

      setAdmin(adminData);
      
      // Store tokens in the format that authService expects
      const accessToken = data.data.accessToken;
      const refreshToken = data.data.refreshToken;
      
      if (accessToken) {
        localStorage.setItem('admin_access_token', accessToken);
        // Keep legacy token for backward compatibility
        localStorage.setItem('admin_token', accessToken);
      }
      if (refreshToken) {
        localStorage.setItem('admin_refresh_token', refreshToken);
      }

      // Force authService to reload tokens from localStorage
      authService.reloadTokensFromStorage();

      console.log('🔥 AuthContext: Login successful, admin set:', adminData);
      console.log('🔥 AuthContext: Tokens stored - access token available:', !!accessToken);
      
    } catch (error) {
      console.error('🔥 AuthContext: Login failed:', error);
      setAdmin(null);
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to restore session from stored token
  const restoreSession = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('admin_access_token') || localStorage.getItem('admin_token');
      if (!token) {
        console.log('🔥 AuthContext: No token found in localStorage');
        setIsLoading(false);
        return;
      }

      console.log('🔥 AuthContext: Token found, validating session...');
      
      // Force authService to reload tokens from localStorage
      authService.reloadTokensFromStorage();
      
      // Validate token with backend
      const response = await fetch('http://localhost:5000/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log('🔥 AuthContext: Token validation failed');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
        setAdmin(null);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log('🔥 AuthContext: Session restored:', data);

      // Restore admin data
      const adminData: Admin = {
        id: data.data.admin.id,
        email: data.data.admin.email,
        name: data.data.admin.name || 'Admin',
        role: data.data.admin.role || 'admin'
      };

      setAdmin(adminData);
      console.log('🔥 AuthContext: Session successfully restored for:', adminData.email);
      
    } catch (error) {
      console.error('🔥 AuthContext: Session restore failed:', error);
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Check for existing session on component mount
  useEffect(() => {
    console.log('🔥 AuthContext: Checking for existing session...');
    restoreSession();
  }, []);

  const logout = (): void => {
    console.log('🔥 AuthContext: Logging out');
    setAdmin(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    // Also clear tokens from authService
    authService.logout();
  };

  const value: AuthContextType = {
    admin,
    isAuthenticated: !!admin,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};