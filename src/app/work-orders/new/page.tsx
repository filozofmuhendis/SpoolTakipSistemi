'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { X, Upload, File, Trash2 } from 'lucide-react'
import { jobOrderService } from '@/lib/services/workOrders'
import { personnelService } from '@/lib/services/personnel'
import { projectService } from '@/lib/services/projects'
import { storageService } from '@/lib/services/storage'

interface NewJobOrderForm {
  project_id: string
  spool_id: string
  description: string
  status: string
  planned_start_date: string
  planned_end_date: string
  actual_start_date?: string
  actual_end_date?: string
  created_by?: string
}

export default function NewWorkOrder({ onClose }: { onClose: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<NewJobOrderForm>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const projectsData = await projectService.getAllProjects()
      setProjects(projectsData)
    } catch (error) {
      console.log('Veri yüklenirken hata:', error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Dosya tipi ve boyut kontrolü
    const validFiles = files.filter(file => {
      const allowedTypes = ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      const maxSize = 5 * 1024 * 1024 // 5MB
      
      if (!storageService.isValidFileType(file, allowedTypes)) {
        setError(`${file.name} dosya tipi desteklenmiyor.`)
        return false
      }
      
      if (!storageService.isValidFileSize(file, maxSize)) {
        setError(`${file.name} dosyası çok büyük. Maksimum 5MB olmalı.`)
        return false
      }
      
      return true
    })
    
    if (validFiles.length > 0) {
      setError(null)
      setSelectedFiles(prev => [...prev, ...validFiles])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async (jobOrderId: string) => {
    const uploadPromises = selectedFiles.map(async (file) => {
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
      
      try {
        const uploadedFile = await storageService.uploadFile(file, 'workOrder', jobOrderId)
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
        return uploadedFile
      } catch (error) {
        console.log('Dosya yükleme hatası:', error)
        setUploadProgress(prev => ({ ...prev, [file.name]: -1 }))
        return null
      }
    })

    const results = await Promise.all(uploadPromises)
    const successfulUploads = results.filter(result => result !== null)
    
    if (successfulUploads.length > 0) {
      setSuccess(`${successfulUploads.length} dosya başarıyla yüklendi.`)
    }
    
    // Progress'i temizle
    setTimeout(() => {
      setUploadProgress({})
    }, 3000)
  }

  const onSubmit = async (data: NewJobOrderForm) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      // İş emrini oluştur
      const newJobOrder = await jobOrderService.createJobOrder({
        project_id: data.project_id,
        spool_id: data.spool_id,
        description: data.description,
        status: data.status,
        planned_start_date: data.planned_start_date,
        planned_end_date: data.planned_end_date,
        actual_start_date: data.actual_start_date || undefined,
        actual_end_date: data.actual_end_date || undefined,
        created_by: data.created_by || undefined
      })

      // İş emri oluşturulduktan sonra dosyaları yükle
      if (newJobOrder && selectedFiles.length > 0) {
        await uploadFiles(newJobOrder.id)
      }

      onClose()
    } catch (error: any) {
      setError(error.message || 'İş emri oluşturulurken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <File className="w-4 h-4 text-green-500" />
    if (fileType === 'application/pdf') return <File className="w-4 h-4 text-red-500" />
    return <File className="w-4 h-4 text-blue-500" />
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="rounded-xl shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Yeni İş Emri Oluştur</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              {success}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="project_id" className="block text-sm font-medium mb-2">Proje</label>
              <select
                {...register('project_id', { required: 'Proje seçilmelidir' })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Proje seçiniz...</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
              {errors.project_id && (
                <span className="text-red-500 text-sm">{errors.project_id.message}</span>
              )}
            </div>
            <div>
              <label htmlFor="spool_id" className="block text-sm font-medium mb-2">Spool ID</label>
              <input
                {...register('spool_id', { required: 'Spool ID gerekli' })}
                className="w-full p-2 border rounded-lg"
                placeholder="Spool ID"
              />
              {errors.spool_id && (
                <span className="text-red-500 text-sm">{errors.spool_id.message}</span>
              )}
            </div>
            <div>
              <label htmlFor="planned_start_date" className="block text-sm font-medium mb-2">Planlanan Başlangıç</label>
              <input
                type="date"
                {...register('planned_start_date', { required: 'Başlangıç tarihi gerekli' })}
                className="w-full p-2 border rounded-lg"
              />
              {errors.planned_start_date && (
                <span className="text-red-500 text-sm">{errors.planned_start_date.message}</span>
              )}
            </div>
            <div>
              <label htmlFor="planned_end_date" className="block text-sm font-medium mb-2">Planlanan Bitiş</label>
              <input
                type="date"
                {...register('planned_end_date', { required: 'Bitiş tarihi gerekli' })}
                className="w-full p-2 border rounded-lg"
              />
              {errors.planned_end_date && (
                <span className="text-red-500 text-sm">{errors.planned_end_date.message}</span>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">Açıklama</label>
            <textarea
              {...register('description', { required: 'Açıklama gerekli' })}
              rows={4}
              className="w-full p-2 border rounded-lg"
              placeholder="İş emri açıklaması..."
            />
            {errors.description && (
              <span className="text-red-500 text-sm">{errors.description.message}</span>
            )}
          </div>

          {/* Dosya Seçme Alanı */}
          <div>
            <label className="block text-sm font-medium mb-2">Dosyalar</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Dosyaları seçmek için{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    tıklayın
                  </button>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Maksimum 10 dosya, 5MB boyutunda (Resim, PDF, Word)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Seçilen Dosyalar */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">
                Seçilen Dosyalar ({selectedFiles.length})
              </h4>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                  >
                    <div className="flex items-center space-x-2">
                      {getFileIcon(file.type)}
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({storageService.formatFileSize(file.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Yükleme İlerlemesi */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Dosya Yükleme İlerlemesi</h4>
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {fileName}
                    </span>
                    <span className="text-sm text-gray-500">
                      {progress === -1 ? 'Hata' : `${progress}%`}
                    </span>
                  </div>
                  {progress !== -1 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isLoading ? 'Oluşturuluyor...' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
