'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Camera, Upload } from 'lucide-react'
import { shipmentService } from '@/lib/services/shipments'

interface OutgoingMaterialForm {
  date: string
  type: 'material' | 'scrap' | 'return'
  company: string
  waybillNo: string
  description: string
  photos: FileList
  documents: FileList
}

export default function OutgoingMaterial({ onBack }: { onBack: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<OutgoingMaterialForm>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (data: OutgoingMaterialForm) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await shipmentService.createShipment({
        number: `OUT-${Date.now()}`, // Otomatik numara oluştur
        projectId: '', // Giden malzeme için proje ID'si boş olabilir
        status: 'pending',
        priority: 'medium',
        destination: data.company,
        scheduledDate: data.date,
        carrier: data.company,
        trackingNumber: data.waybillNo,
        totalWeight: 0 // Giden malzeme için ağırlık bilgisi yok
      })
      
      onBack()
    } catch (error: any) {
      console.error('Giden malzeme kaydetme hatası:', error)
      setError(error.message || 'Malzeme kaydedilirken bir hata oluştu')
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <label className="block mb-2">Sevkiyat Türü</label>
            <select
              {...register('type', { required: 'Sevkiyat türü gereklidir' })}
              className="w-full p-2 border rounded"
            >
              <option value="material">Malzeme Sevkiyatı</option>
              <option value="scrap">Hurda İadesi</option>
              <option value="return">Malzeme İadesi</option>
            </select>
          </div>

          <div>
            <label className="block mb-2">Firma</label>
            <input
              {...register('company', { required: 'Firma adı gereklidir' })}
              className="w-full p-2 border rounded"
              placeholder="Firma adı giriniz"
            />
          </div>

          <div>
            <label className="block mb-2">İrsaliye No</label>
            <input
              {...register('waybillNo', { required: 'İrsaliye no gereklidir' })}
              className="w-full p-2 border rounded"
              placeholder="İrsaliye numarası giriniz"
            />
          </div>
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
          className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-yellow-300"
        >
          {isLoading ? 'Kaydediliyor...' : 'Sevkiyatı Kaydet'}
        </button>
      </form>
    </div>
  )
}