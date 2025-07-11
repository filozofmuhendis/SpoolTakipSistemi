'use client'

import { useState } from 'react'
import FileUploadComponent from '@/components/ui/FileUpload'
import { FileUpload } from '@/lib/services/storage'
import { useToast } from '@/components/ui/ToastProvider'

export default function TestUploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([])
  const { showToast } = useToast()

  const handleUploadComplete = (file: FileUpload) => {
    setUploadedFiles(prev => [...prev, file])
    showToast({ 
      type: 'success', 
      message: `${file.name} başarıyla yüklendi!` 
    })
  }

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error)
    showToast({ 
      type: 'error', 
      message: error 
    })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Dosya Yükleme Testi</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Supabase Storage bucket'ını test etmek için dosya yükleyin.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <FileUploadComponent
          entityType="project"
          entityId="test-project-123"
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          maxFiles={5}
          maxSize={10 * 1024 * 1024} // 10MB
          allowedTypes={[
            'image/*',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ]}
        />
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Yüklenen Dosyalar</h2>
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                      {file.name.split('.').pop()?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  Görüntüle
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 