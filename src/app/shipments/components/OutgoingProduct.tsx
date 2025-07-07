'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Camera, Upload, Scan } from 'lucide-react'
import { shipmentService } from '@/lib/services/shipments'
import { projectService } from '@/lib/services/projects'
import { useToast } from '@/components/ui/ToastProvider'
import { storageService } from '@/lib/services/storage'

interface OutgoingProductForm {
  projectId: string
  date: string
  spoolNumber: string
  transportCompany: string
  description: string
  photos: FileList
  documents: FileList
}

export default function OutgoingProduct({ onBack }: { onBack: () => void }) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<OutgoingProductForm>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showScanner, setShowScanner] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const { showToast } = useToast()

  useEffect(() => {
    projectService.getAllProjects().then(setProjects)
  }, [])

  const onSubmit = async (data: OutgoingProductForm) => {
    setIsLoading(true)
    setError(null)
    try {
      const shipment = await shipmentService.createShipment({
        number: `PROD-${Date.now()}`,
        projectId: data.projectId,
        status: 'pending',
        priority: 'medium',
        destination: data.transportCompany || 'Müşteri',
        scheduledDate: data.date,
        carrier: data.transportCompany || 'Kendi Araç',
        trackingNumber: data.spoolNumber,
        totalWeight: 0
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
      showToast({ type: 'success', message: 'Giden ürün kaydedildi!' })
      onBack()
    } catch (error: any) {
      console.log('Giden ürün kaydetme hatası:', error)
      setError(error.message || 'Ürün kaydedilirken bir hata oluştu')
      showToast({ type: 'error', message: 'Ürün kaydedilirken bir hata oluştu' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBarcodeScan = (result: string) => {
    setValue('spoolNumber', result)
    setShowScanner(false)
  }

  return (
    <div className="p-6 bg-black">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="mr-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-semibold">Giden Ürün Sevkiyatı</h2>
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
            {...register('projectId', { required: 'Proje seçilmelidir' })}
            className="w-full p-2 border rounded"
          >
            <option value="">Proje seçin</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          {errors.projectId && (
            <span className="text-red-500 text-sm">{errors.projectId.message}</span>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <label className="block mb-2">Sevkiyat Tarihi</label>
            <input
              type="date"
              {...register('date', { required: 'Tarih gereklidir' })}
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Spool Numarası</label>
            <div className="flex gap-2">
              <input
                {...register('spoolNumber', { required: 'Spool numarası gereklidir' })}
                className="flex-1 p-2 border rounded"
                placeholder="Spool numarası giriniz veya barkod okutunuz"
              />
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <Scan className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div>
            <label className="block mb-2">Taşıyan Firma</label>
            <input
              {...register('transportCompany')}
              className="w-full p-2 border rounded"
              placeholder="Taşıyan firma adı"
            />
          </div>
          <div>
            <label className="block mb-2">Açıklama</label>
            <textarea
              {...register('description')}
              className="w-full p-2 border rounded"
              rows={3}
              placeholder="Sevkiyat açıklaması"
            />
          </div>
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
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? 'Kaydediliyor...' : 'Sevkiyatı Kaydet'}
        </button>
      </form>
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Barkod Tarama</h3>
            {/* Barkod okuyucu komponenti buraya eklenecek */}
            <button
              onClick={() => setShowScanner(false)}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
