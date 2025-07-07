'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, File, Image, FileText, Trash2, CheckCircle, AlertCircle } from 'lucide-react'
import { storageService, FileUpload } from '@/lib/services/storage'

interface FileUploadProps {
  entityType: FileUpload['entityType']
  entityId: string
  onUploadComplete?: (file: FileUpload) => void
  onUploadError?: (error: string) => void
  maxFiles?: number
  allowedTypes?: string[]
  maxSize?: number
  className?: string
}

export default function FileUploadComponent({
  entityType,
  entityId,
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  allowedTypes = ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  maxSize = 5 * 1024 * 1024, // 5MB
  className = ''
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }, [])

  const handleFiles = async (files: File[]) => {
    if (uploadedFiles.length + files.length > maxFiles) {
      onUploadError?.(`Maksimum ${maxFiles} dosya yükleyebilirsiniz.`)
      return
    }

    for (const file of files) {
      // Dosya tipi kontrolü
      if (!storageService.isValidFileType(file, allowedTypes)) {
        onUploadError?.(`${file.name} dosya tipi desteklenmiyor.`)
        continue
      }

      // Dosya boyutu kontrolü
      if (!storageService.isValidFileSize(file, maxSize)) {
        onUploadError?.(`${file.name} dosyası çok büyük. Maksimum ${storageService.formatFileSize(maxSize)} olmalı.`)
        continue
      }

      await uploadFile(file)
    }
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))

    try {
      const uploadedFile = await storageService.uploadFile(file, entityType, entityId)
      
      if (uploadedFile) {
        setUploadedFiles(prev => [...prev, uploadedFile])
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
        onUploadComplete?.(uploadedFile)
      } else {
        onUploadError?.(`${file.name} yüklenirken hata oluştu.`)
      }
    } catch (error) {
      console.log('Dosya yükleme hatası:', error)
      onUploadError?.(`${file.name} yüklenirken hata oluştu.`)
    } finally {
      setUploading(false)
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[file.name]
          return newProgress
        })
      }, 2000)
    }
  }

  const deleteFile = async (fileId: string) => {
    try {
      const success = await storageService.deleteFile(fileId)
      if (success) {
        setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
      } else {
        onUploadError?.('Dosya silinirken hata oluştu.')
      }
    } catch (error) {
      console.log('Dosya silme hatası:', error)
      onUploadError?.('Dosya silinirken hata oluştu.')
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />
    if (fileType === 'application/pdf') return <FileText className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Dosyaları buraya sürükleyin veya{' '}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              dosya seçin
            </button>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Maksimum {maxFiles} dosya, {storageService.formatFileSize(maxSize)} boyutunda
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {fileName}
                </span>
                <span className="text-sm text-gray-500">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Yüklenen Dosyalar ({uploadedFiles.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {getFileIcon(file.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {storageService.formatFileSize(file.size)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(file.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Görüntüle"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => file.id && deleteFile(file.id)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {file.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {file.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {uploading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            Dosya yükleniyor...
          </span>
        </div>
      )}
    </div>
  )
} 
