import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  description?: string;
}

export default function ErrorState({ title = 'Bir hata oluştu', description = '' }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
      <div className="text-lg font-semibold text-red-600 dark:text-red-400">{title}</div>
      {description && <div className="text-gray-500 dark:text-gray-400 mt-1">{description}</div>}
    </div>
  );
} 
