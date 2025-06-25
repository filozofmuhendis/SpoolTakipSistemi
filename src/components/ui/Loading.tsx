import React from 'react';

export default function Loading({ text = 'Yükleniyor...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
      <span className="text-gray-600 dark:text-gray-300">{text}</span>
    </div>
  );
} 
