import React from 'react';
import { EyeIcon, DevicePhoneMobileIcon, ComputerDesktopIcon, DeviceTabletIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui';

interface ContentPreviewProps {
  content: string;
  title?: string;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const ContentPreview: React.FC<ContentPreviewProps> = ({
  content,
  title = 'Content Preview',
  isVisible = true,
  onToggleVisibility,
}) => {
  const [viewport, setViewport] = React.useState<ViewportSize>('desktop');

  const getViewportStyles = () => {
    switch (viewport) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-2xl mx-auto';
      case 'desktop':
      default:
        return 'w-full';
    }
  };

  const getViewportIcon = (size: ViewportSize) => {
    switch (size) {
      case 'mobile':
        return DevicePhoneMobileIcon;
      case 'tablet':
        return DeviceTabletIcon;
      case 'desktop':
      default:
        return ComputerDesktopIcon;
    }
  };

  if (!isVisible) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 text-center">
        <EyeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Preview Hidden</h3>
        <p className="text-gray-400 mb-4">Click the button below to show the live preview</p>
        {onToggleVisibility && (
          <Button onClick={onToggleVisibility} variant="outline" size="sm">
            <EyeIcon className="w-4 h-4 mr-2" />
            Show Preview
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
      {/* Preview Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-600 bg-gray-900">
        <div className="flex items-center space-x-3">
          <EyeIcon className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-medium text-white">{title}</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Viewport Selector */}
          <div className="flex items-center space-x-1 bg-gray-800 rounded-lg p-1">
            {(['desktop', 'tablet', 'mobile'] as ViewportSize[]).map((size) => {
              const Icon = getViewportIcon(size);
              return (
                <button
                  key={size}
                  onClick={() => setViewport(size)}
                  className={`
                    p-2 rounded transition-colors
                    ${viewport === size 
                      ? 'bg-amber-500 text-black' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }
                  `}
                  title={`${size.charAt(0).toUpperCase() + size.slice(1)} view`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
          
          {/* Hide Preview Button */}
          {onToggleVisibility && (
            <Button onClick={onToggleVisibility} variant="ghost" size="sm">
              Hide Preview
            </Button>
          )}
        </div>
      </div>

      {/* Preview Content */}
      <div className="p-6 bg-white min-h-[400px]">
        <div className={`transition-all duration-300 ${getViewportStyles()}`}>
          {/* Viewport Size Indicator */}
          <div className="mb-4 text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {viewport.charAt(0).toUpperCase() + viewport.slice(1)} View
              {viewport === 'mobile' && ' (375px)'}
              {viewport === 'tablet' && ' (768px)'}
              {viewport === 'desktop' && ' (1200px+)'}
            </span>
          </div>
          
          {/* Rendered Content */}
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
            style={{
              color: '#1f2937',
              lineHeight: '1.7',
            }}
          />
          
          {/* Empty State */}
          {!content.trim() && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No content to preview</div>
              <div className="text-gray-500 text-sm">
                Start typing in the editor to see your content here
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Footer */}
      <div className="px-4 py-2 bg-gray-900 border-t border-gray-600">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Live Preview - Updates automatically</span>
          <span>
            Content length: {content.replace(/<[^>]*>/g, '').length} characters
          </span>
        </div>
      </div>

      <style jsx>{`
        .prose h1 {
          font-size: 2.25rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 1rem;
          color: #111827;
        }
        
        .prose h2 {
          font-size: 1.875rem;
          font-weight: 700;
          line-height: 1.3;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #111827;
        }
        
        .prose h3 {
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.4;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #111827;
        }
        
        .prose p {
          margin-bottom: 1rem;
          color: #374151;
        }
        
        .prose blockquote {
          border-left: 4px solid #F59E0B;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #6B7280;
        }
        
        .prose ul, .prose ol {
          margin: 1rem 0;
          padding-left: 2rem;
        }
        
        .prose li {
          margin: 0.5rem 0;
          color: #374151;
        }
        
        .prose a {
          color: #F59E0B;
          text-decoration: underline;
        }
        
        .prose a:hover {
          color: #D97706;
        }
        
        .prose img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .prose strong {
          font-weight: 600;
          color: #111827;
        }
        
        .prose em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default ContentPreview;