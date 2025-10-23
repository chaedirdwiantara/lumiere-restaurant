import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const baseClasses = `
    bg-gray-900 border border-gray-700 rounded-lg shadow-lg
    ${hover ? 'hover:shadow-xl hover:border-gray-600 transition-all duration-200' : ''}
    ${paddingClasses[padding]}
    ${className}
  `;

  return (
    <div className={baseClasses}>
      {children}
    </div>
  );
};

export default Card;