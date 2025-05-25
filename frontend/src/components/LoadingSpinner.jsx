import React from 'react';
import { Calendar } from 'lucide-react';

const LoadingSpinner = ({ size = 'large', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Calendar className={`${sizeClasses[size]} text-primary-600 animate-pulse`} />
        </div>
        <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizeClasses[size]} mx-auto mb-4`}></div>
        <p className={`text-gray-600 ${textSizeClasses[size]}`}>{text}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner; 