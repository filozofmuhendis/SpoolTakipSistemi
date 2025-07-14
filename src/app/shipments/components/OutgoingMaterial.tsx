'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Camera, Upload } from 'lucide-react'
import { shipmentService } from '@/lib/services/shipments'
import { projectService } from '@/lib/services/projects'
import { useToast } from '@/components/ui/ToastProvider'
import { storageService, FileUpload } from '@/lib/services/storage'

interface OutgoingMaterialForm {
  project_id: string
  shipment_date: string
  notes: string
  photos: FileList
  documents: FileList
}

export default function OutgoingMaterial({ onBack }: { onBack: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<OutgoingMaterialForm>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([])
  const { showToast } = useToast()

  useEffect(() => {
    projectService.getAllProjects().then(setProjects)
  }, [])

  const uploadFiles = async (files: File[], shipmentId: string) => {
    const uploaded: FileUpload[] = []
    for (const file of files) {
      const result = await storageService.uploadFile(file, 'shipment', shipmentId)
      if (result) {
        uploaded.push(result)
        showToast({ type: 'success', message: `${file.name} yüklendi!` })
      } else {
        showToast({ type: 'error', message: `${file.name} yüklenemedi!` })
      }
    }
    return uploaded
  }

  const onSubmit = async (data: OutgoingMaterialForm) => {
    setIsLoading(true)
    setError(null)
    setUploadedFiles([])
    try {
      const shipment = await shipmentService.createShipment({
        project_id: data.project_id,
        status: 'pending',
        shipment_date: data.shipment_date,
        notes: data.notes
      })
      // Fotoğraf ve belgeleri yükle
      const filesToUpload: File[] = [
        ...(data.photos ? Array.from(data.photos) : []),
        ...(data.documents ? Array.from(data.documents) : [])
      ]
      const uploaded = await uploadFiles(filesToUpload, shipment.id)
      setUploadedFiles(uploaded)
      showToast({ type: 'success', message: 'Giden malzeme kaydedildi ve dosyalar yüklendi!' })
      onBack()
    } catch (error: any) {
      console.log('Giden malzeme kaydetme hatası:', error)
      setError(error.message || 'Malzeme kaydedilirken bir hata oluştu')
      showToast({ type: 'error', message: 'Malzeme kaydedilirken bir hata oluştu' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 bg-black">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="mr-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-semibold">Giden Malzeme Sevkiyatı</h2>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label className="block mb-2">Proje *</label>
          <select
            {...register('project_id', { required: 'Proje seçilmelidir' })}
            className="w-full p-2 border rounded"
          >
            <option value="">Proje seçin</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          {errors.project_id && (
            <span className="text-red-500 text-sm">{errors.project_id.message}</span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2">Sevkiyat Tarihi</label>
            <input
              type="date"
              {...register('shipment_date', { required: 'Tarih gereklidir' })}
              className="w-full p-2 border rounded"
            />
            {errors.shipment_date && (
              <span className="text-red-500 text-sm">{errors.shipment_date.message}</span>
            )}
          </div>
        </div>
        <div>
          <label className="block mb-2">Notlar</label>
          <textarea
            {...register('notes')}
            className="w-full p-2 border rounded"
            rows={3}
            placeholder="Sevkiyat hakkında notlar..."
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2">
              <Camera className="w-4 h-4 inline mr-2" />
              Fotoğraf Ekle
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              {...register('photos')}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">
              <Upload className="w-4 h-4 inline mr-2" />
              Belge Ekle
            </label>
            <input
              type="file"
              accept=".pdf,image/*"
              multiple
              {...register('documents')}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
        >
          {isLoading ? 'Kaydediliyor...' : 'Sevkiyatı Kaydet'}
        </button>
      </form>
      {uploadedFiles.length > 0 && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Yüklenen Dosyalar</h3>
          <ul className="space-y-2">
            {uploadedFiles.map((file) => (
              <li key={file.id} className="flex items-center gap-2">
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {file.name}
                </a>
                <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
