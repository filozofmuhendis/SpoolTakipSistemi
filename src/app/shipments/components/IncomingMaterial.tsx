'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Camera, Upload } from 'lucide-react'

interface IncomingMaterialForm {
  date: string
  company: string
  waybillNo: string
  description: string
  photos: FileList
  documents: FileList
}

export default function IncomingMaterial({ onBack }: { onBack: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<IncomingMaterialForm>()
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (data: IncomingMaterialForm) => {
    setIsLoading(true)
    console.log(data)
    // API implementation will be here
    setIsLoading(false)
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
        <div className="space-y-4">
          <div>
            <label className="block mb-2">Tarih</label>
            <input
              type="date"
              {...register('date', { required: 'Tarih gereklidir' })}
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border rounded"
            />
            {errors.date && (
              <span className="text-red-500 text-sm">{errors.date.message}</span>
            )}
          </div>

          <div>
            <label className="block mb-2">Geldiği Firma</label>
            <input
              {...register('company', { required: 'Firma adı gereklidir' })}
              className="w-full p-2 border rounded"
              placeholder="Firma adı giriniz"
            />
            {errors.company && (
              <span className="text-red-500 text-sm">{errors.company.message}</span>
            )}
          </div>

          <div>
            <label className="block mb-2">İrsaliye No</label>
            <input
              {...register('waybillNo', { required: 'İrsaliye no gereklidir' })}
              className="w-full p-2 border rounded"
              placeholder="İrsaliye numarası giriniz"
            />
            {errors.waybillNo && (
              <span className="text-red-500 text-sm">{errors.waybillNo.message}</span>
            )}
          </div>

          <div>
            <label className="block mb-2">Açıklama</label>
            <textarea
              {...register('description')}
              className="w-full p-2 border rounded"
              rows={3}
              placeholder="Opsiyonel açıklama"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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