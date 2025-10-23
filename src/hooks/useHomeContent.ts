import { useState, useEffect, useCallback } from 'react';
import { HomeService } from '../services/homeService';
import type { HomeContent, ApiError } from '../types/api';

interface UseHomeContentState {
  content: Record<string, HomeContent[]>;
  loading: boolean;
  error: ApiError | null;
  isOnline: boolean;
}

interface UseHomeContentOptions {
  section?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useHomeContent = (options: UseHomeContentOptions = {}) => {
  const [state, setState] = useState<UseHomeContentState>({
    content: {},
    loading: true,
    error: null,
    isOnline: navigator.onLine,
  });

  const { section, autoRefresh = false, refreshInterval = 60000 } = options;

  // Fetch content function
  const fetchContent = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      let content: Record<string, HomeContent[]>;
      
      if (section) {
        const sectionContent = await HomeService.getContentBySection(section);
        content = { [section]: [sectionContent] };
      } else {
        content = await HomeService.getContentBySections();
      }

      // Preload content images
      const allContent = Object.values(content).flat();
      HomeService.preloadContentImages(allContent);

      setState(prev => ({
        ...prev,
        content,
        loading: false,
        error: null,
      }));

      console.log(`✅ Loaded home content for ${Object.keys(content).length} sections`);
      
    } catch (error) {
      console.error('❌ Failed to fetch home content:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as ApiError,
      }));

      // Use fallback content if API fails
      if (!navigator.onLine || (error as any)?.code === 'NETWORK_ERROR') {
        console.log('🔄 Using fallback content due to network issues');
        const fallbackContent = HomeService.getFallbackContent();
        const organizedFallback: Record<string, HomeContent[]> = {};
        
        Object.entries(fallbackContent).forEach(([key, value]) => {
          organizedFallback[key] = [value as HomeContent];
        });

        setState(prev => ({
          ...prev,
          content: organizedFallback,
          loading: false,
        }));
      }
    }
  }, [section]);

  // Get specific section content
  const getSection = useCallback((sectionName: string): HomeContent | null => {
    const sectionContent = state.content[sectionName];
    return sectionContent && sectionContent.length > 0 ? sectionContent[0] : null;
  }, [state.content]);

  // Get multiple items from a section (like features, testimonials)
  const getSectionItems = useCallback((sectionName: string): HomeContent[] => {
    return state.content[sectionName] || [];
  }, [state.content]);

  // Retry function
  const retry = useCallback(() => {
    fetchContent();
  }, [fetchContent]);

  // Refresh function
  const refresh = useCallback(() => {
    fetchContent();
  }, [fetchContent]);

  // Initial load
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (navigator.onLine && !state.loading) {
        fetchContent();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchContent, state.loading]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      if (state.error) {
        fetchContent();
      }
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchContent, state.error]);

  return {
    ...state,
    getSection,
    getSectionItems,
    retry,
    refresh,
    fetchContent,
  };
};

export default useHomeContent;