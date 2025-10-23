import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'image' | 'hero' | 'gallery';
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  className = '', 
  variant = 'text',
  count = 1 
}) => {
  const baseClasses = 'animate-pulse bg-white/10 rounded';
  
  const variants = {
    text: 'h-4 w-full',
    card: 'h-48 w-full',
    image: 'h-64 w-full',
    hero: 'h-96 w-full',
    gallery: 'aspect-square w-full'
  };

  const skeletonClass = `${baseClasses} ${variants[variant]} ${className}`;

  if (count === 1) {
    return <div className={skeletonClass} />;
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={skeletonClass} />
      ))}
    </div>
  );
};

interface ContentSkeletonProps {
  type: 'hero' | 'about' | 'features' | 'testimonials' | 'cta' | 'gallery';
  className?: string;
}

export const ContentSkeleton: React.FC<ContentSkeletonProps> = ({ type, className = '' }) => {
  const skeletons = {
    hero: (
      <div className={`space-y-6 ${className}`}>
        <LoadingSkeleton variant="text" className="h-16 w-3/4 mx-auto" />
        <LoadingSkeleton variant="text" className="h-6 w-1/2 mx-auto" />
        <LoadingSkeleton variant="text" className="h-4 w-2/3 mx-auto" />
        <LoadingSkeleton variant="text" className="h-12 w-48 mx-auto rounded-full" />
      </div>
    ),
    about: (
      <div className={`space-y-6 ${className}`}>
        <LoadingSkeleton variant="text" className="h-12 w-1/2 mx-auto" />
        <LoadingSkeleton variant="text" className="h-4 w-3/4 mx-auto" />
        <LoadingSkeleton variant="text" className="h-4 w-2/3 mx-auto" />
      </div>
    ),
    features: (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${className}`}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-4">
            <LoadingSkeleton variant="text" className="h-16 w-16 mx-auto rounded-full" />
            <LoadingSkeleton variant="text" className="h-6 w-3/4 mx-auto" />
            <LoadingSkeleton variant="text" className="h-4 w-full" />
            <LoadingSkeleton variant="text" className="h-4 w-5/6 mx-auto" />
          </div>
        ))}
      </div>
    ),
    testimonials: (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${className}`}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-4 p-6 bg-black/20 rounded-lg">
            <div className="flex space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <LoadingSkeleton key={i} variant="text" className="h-4 w-4" />
              ))}
            </div>
            <LoadingSkeleton variant="text" className="h-4 w-full" />
            <LoadingSkeleton variant="text" className="h-4 w-4/5" />
            <div className="flex items-center space-x-3 pt-4">
              <LoadingSkeleton variant="text" className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <LoadingSkeleton variant="text" className="h-4 w-24" />
                <LoadingSkeleton variant="text" className="h-3 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
    cta: (
      <div className={`space-y-6 text-center ${className}`}>
        <LoadingSkeleton variant="text" className="h-16 w-1/2 mx-auto" />
        <LoadingSkeleton variant="text" className="h-6 w-3/4 mx-auto" />
        <LoadingSkeleton variant="text" className="h-12 w-48 mx-auto rounded-full" />
      </div>
    ),
    gallery: (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <LoadingSkeleton key={index} variant="gallery" />
        ))}
      </div>
    )
  };

  return skeletons[type] || null;
};

export default LoadingSkeleton;