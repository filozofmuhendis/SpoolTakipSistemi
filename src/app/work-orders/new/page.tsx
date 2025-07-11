'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { jobOrderService } from '@/lib/services/workOrders'
import { personnelService } from '@/lib/services/personnel'
import { projectService } from '@/lib/services/projects'

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
  const [projects, setProjects] = useState<any[]>([])

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

  const onSubmit = async (data: NewJobOrderForm) => {
    setIsLoading(true)
    setError(null)
    try {
      await jobOrderService.createJobOrder({
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
      onClose()
    } catch (error: any) {
      setError(error.message || 'İş emri oluşturulurken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="rounded-xl shadow-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Yeni İş Emri Oluştur</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
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
