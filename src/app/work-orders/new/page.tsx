'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'

interface NewWorkOrderForm {
  projectNumber: string
  spoolNumber: string
  assignedTo: string
  startDate: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
  description: string
}

export default function NewWorkOrder({ onClose }: { onClose: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<NewWorkOrderForm>()
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (data: NewWorkOrderForm) => {
    setIsLoading(true)
    try {
      // API call will be implemented here
      console.log(data)
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className=" rounded-xl shadow-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Yeni İş Emri Oluştur</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="projectNumber" className="block text-sm font-medium mb-2">Proje Numarası</label>
              <input
                {...register('projectNumber', { required: 'Proje numarası gerekli' })}
                className="w-full p-2 border rounded-lg"
                placeholder="PRJ-001"
              />
              {errors.projectNumber && (
                <span className="text-red-500 text-sm">{errors.projectNumber.message}</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Spool Numarası</label>
              <input
                {...register('spoolNumber', { required: 'Spool numarası gerekli' })}
                className="w-full p-2 border rounded-lg"
                placeholder="SP01"
              />
              {errors.spoolNumber && (
                <span className="text-red-500 text-sm">{errors.spoolNumber.message}</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Atanan Kişi</label>
              <select
                {...register('assignedTo', { required: 'Atanan kişi gerekli' })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Seçiniz...</option>
                <option value="1">Ahmet Yılmaz</option>
                <option value="2">Mehmet Demir</option>
              </select>
              {errors.assignedTo && (
                <span className="text-red-500 text-sm">{errors.assignedTo.message}</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Öncelik</label>
              <select
                {...register('priority', { required: 'Öncelik gerekli' })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="low">Düşük</option>
                <option value="medium">Orta</option>
                <option value="high">Yüksek</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Başlangıç Tarihi</label>
              <input
                type="date"
                {...register('startDate', { required: 'Başlangıç tarihi gerekli' })}
                className="w-full p-2 border rounded-lg"
              />
              {errors.startDate && (
                <span className="text-red-500 text-sm">{errors.startDate.message}</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Termin Tarihi</label>
              <input
                type="date"
                {...register('dueDate', { required: 'Termin tarihi gerekli' })}
                className="w-full p-2 border rounded-lg"
              />
              {errors.dueDate && (
                <span className="text-red-500 text-sm">{errors.dueDate.message}</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Açıklama</label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full p-2 border rounded-lg"
              placeholder="İş emri açıklaması..."
            />
          </div>

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