'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Camera, Upload } from 'lucide-react'
import { shipmentService } from '@/lib/services/shipments'
import { projectService } from '@/lib/services/projects'
import { useToast } from '@/components/ui/ToastProvider'
import { storageService } from '@/lib/services/storage'

interface IncomingMaterialForm {
  project_id: string
  shipment_date: string
  notes: string
  photos: FileList
  documents: FileList
}

export default function IncomingMaterial({ onBack }: { onBack: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<IncomingMaterialForm>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<any[]>([])
  const { showToast } = useToast()

  useEffect(() => {
    projectService.getAllProjects().then(setProjects)
  }, [])

  const onSubmit = async (data: IncomingMaterialForm) => {
    setIsLoading(true)
    setError(null)
    
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
      for (const file of filesToUpload) {
        const uploaded = await storageService.uploadFile(file, 'shipment', shipment.id)
        if (uploaded) {
          showToast({ type: 'success', message: `${file.name} yüklendi!` })
        } else {
          showToast({ type: 'error', message: `${file.name} yüklenemedi!` })
        }
      }
      showToast({ type: 'success', message: 'Gelen malzeme kaydedildi!' })
      onBack()
    } catch (error: any) {
      console.log('Gelen malzeme kaydetme hatası:', error)
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
        <h2 className="text-2xl font-semibold">Gelen Malzeme Girişi</h2>
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
              defaultValue={new Date().toISOString().split('T')[0]}
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
          {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </form>
    </div>
  )
}
