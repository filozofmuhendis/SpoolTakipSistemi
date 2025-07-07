import React from 'react';
import { AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ title = 'Kayıt bulunamadı', description = '', icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="mb-2 text-gray-400">{icon || <AlertCircle className="w-10 h-10" />}</div>
      <div className="text-lg font-semibold text-gray-700 dark:text-gray-200">{title}</div>
      {description && <div className="text-gray-500 dark:text-gray-400 mt-1">{description}</div>}
    </div>
  );
} 
