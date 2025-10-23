import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  DocumentTextIcon,
  EyeIcon,
  CloudArrowUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Button, Card, LoadingSpinner, Badge } from '../components/ui';
import { SectionEditor, ContentPreview } from '../components/content';
import { adminApi } from '../services/adminApi';
import { HomeSection, HomeContent } from '../types/admin';

const homeContentSchema = z.object({
  metaTitle: z.string().min(1, 'Meta title is required'),
  metaDescription: z.string().min(1, 'Meta description is required'),
  metaKeywords: z.string().optional(),
  isPublished: z.boolean(),
});

type HomeContentFormData = z.infer<typeof homeContentSchema>;

const HomeContentPage: React.FC = () => {
  const [homeContent, setHomeContent] = useState<HomeContent | null>(null);
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<HomeContentFormData>({
    resolver: zodResolver(homeContentSchema),
  });

  const watchedData = watch();

  // Load home content data
  useEffect(() => {
    loadHomeContent();
  }, []);

  // Track changes for auto-save indication
  useEffect(() => {
    if (homeContent) {
      setHasUnsavedChanges(true);
    }
  }, [watchedData, sections]);

  const loadHomeContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminApi.getHomeContent();
      
      if (response.data) {
        setHomeContent(response.data);
        setSections(response.data.sections || []);
        reset({
          metaTitle: response.data.metaTitle || '',
          metaDescription: response.data.metaDescription || '',
          metaKeywords: response.data.metaKeywords || '',
          isPublished: response.data.isPublished || false,
        });
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Failed to load home content:', error);
      setError('Failed to load home content. Please try again.');
      
      // Initialize with empty data if loading fails
      setHomeContent({
        id: 'home',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        isPublished: false,
        sections: [],
        updatedAt: new Date().toISOString(),
      });
      setSections([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveHomeContent = async (data: HomeContentFormData) => {
    try {
      setIsSaving(true);
      setError(null);

      const updatedContent: HomeContent = {
        id: homeContent?.id || 'home',
        ...data,
        sections,
        updatedAt: new Date().toISOString(),
      };

      await adminApi.updateHomeContent(updatedContent);
      
      setHomeContent(updatedContent);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save home content:', error);
      setError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const publishContent = async () => {
    try {
      setIsSaving(true);
      setError(null);

      if (!homeContent) return;

      const publishedContent = {
        ...homeContent,
        isPublished: true,
        sections,
        updatedAt: new Date().toISOString(),
      };

      await adminApi.updateHomeContent(publishedContent);
      
      setHomeContent(publishedContent);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to publish content:', error);
      setError('Failed to publish content. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const generateFullPreview = () => {
    return sections
      .filter(section => section.isVisible)
      .sort((a, b) => a.order - b.order)
      .map(section => `
        <section class="section-${section.type}" style="margin-bottom: 2rem;">
          <h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 1rem; color: #111827;">
            ${section.title}
          </h2>
          ${section.subtitle ? `
            <h3 style="font-size: 1.25rem; color: #6B7280; margin-bottom: 1.5rem;">
              ${section.subtitle}
            </h3>
          ` : ''}
          <div style="line-height: 1.7;">
            ${section.content}
          </div>
        </section>
      `)
      .join('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Home Content Management</h1>
          <p className="text-gray-400 mt-1">
            Manage your home page content, sections, and SEO settings
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Status Indicators */}
          <div className="flex items-center space-x-2">
            {hasUnsavedChanges && (
              <Badge variant="warning" size="sm">
                <ClockIcon className="w-3 h-3 mr-1" />
                Unsaved Changes
              </Badge>
            )}
            
            {homeContent?.isPublished ? (
              <Badge variant="success" size="sm">
                <CheckCircleIcon className="w-3 h-3 mr-1" />
                Published
              </Badge>
            ) : (
              <Badge variant="default" size="sm">
                Draft
              </Badge>
            )}
            
            {lastSaved && (
              <span className="text-xs text-gray-400">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          {/* Action Buttons */}
          <Button
            onClick={() => setShowPreview(!showPreview)}
            variant="outline"
            size="sm"
          >
            <EyeIcon className="w-4 h-4 mr-2" />
            {showPreview ? 'Hide Preview' : 'Full Preview'}
          </Button>
          
          <Button
            onClick={handleSubmit(saveHomeContent)}
            disabled={isSaving || !hasUnsavedChanges}
            size="sm"
          >
            <CloudArrowUpIcon className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          
          <Button
            onClick={publishContent}
            disabled={isSaving || hasUnsavedChanges}
            variant="primary"
            size="sm"
          >
            {homeContent?.isPublished ? 'Update Published' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="p-4 bg-red-900/20 border-red-500">
          <div className="flex items-center space-x-2 text-red-400">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Full Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Full Page Preview</h3>
              <Button onClick={() => setShowPreview(false)} variant="ghost" size="sm">
                Close
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div dangerouslySetInnerHTML={{ __html: generateFullPreview() }} />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="xl:col-span-2 space-y-6">
          {/* SEO Settings */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <DocumentTextIcon className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-semibold text-white">SEO Settings</h2>
            </div>
            
            <form onSubmit={handleSubmit(saveHomeContent)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meta Title
                </label>
                <input
                  {...register('metaTitle')}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter meta title for SEO"
                />
                {errors.metaTitle && (
                  <p className="mt-1 text-sm text-red-400">{errors.metaTitle.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meta Description
                </label>
                <textarea
                  {...register('metaDescription')}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter meta description for SEO"
                />
                {errors.metaDescription && (
                  <p className="mt-1 text-sm text-red-400">{errors.metaDescription.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meta Keywords (Optional)
                </label>
                <input
                  {...register('metaKeywords')}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter keywords separated by commas"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    {...register('isPublished')}
                    className="rounded border-gray-600 bg-gray-800 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Published (visible to public)</span>
                </label>
              </div>
            </form>
          </Card>

          {/* Section Editor */}
          <SectionEditor
            sections={sections}
            onSectionsChange={setSections}
            isLoading={isSaving}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Content Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Sections:</span>
                <span className="text-white font-medium">{sections.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Visible Sections:</span>
                <span className="text-white font-medium">
                  {sections.filter(s => s.isVisible).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Words:</span>
                <span className="text-white font-medium">
                  {sections.reduce((acc, section) => 
                    acc + section.content.replace(/<[^>]*>/g, '').split(' ').length, 0
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <Badge variant={homeContent?.isPublished ? 'success' : 'default'} size="sm">
                  {homeContent?.isPublished ? 'Published' : 'Draft'}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Section Preview */}
          {sections.length > 0 && (
            <ContentPreview
              content={sections.find(s => s.isVisible)?.content || sections[0].content}
              title="Section Preview"
              isVisible={true}
            />
          )}

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                onClick={() => window.open('/', '_blank')}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                View Live Site
              </Button>
              
              <Button
                onClick={handleSubmit(saveHomeContent)}
                disabled={isSaving || !hasUnsavedChanges}
                size="sm"
                className="w-full"
              >
                <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                Save All Changes
              </Button>
              
              <Button
                onClick={loadHomeContent}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                Refresh Content
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomeContentPage;