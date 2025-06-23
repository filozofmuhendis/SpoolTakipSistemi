'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { workOrderService } from '@/lib/services/workOrders'
import { personnelService } from '@/lib/services/personnel'
import { projectService } from '@/lib/services/projects'
import { Personnel, Project } from '@/types'

interface NewWorkOrderForm {
  projectId: string
  spoolNumber: string
  assignedTo: string
  startDate: string
  dueDate: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  description: string
}

export default function NewWorkOrder({ onClose }: { onClose: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<NewWorkOrderForm>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [personnelData, projectsData] = await Promise.all([
        personnelService.getAllPersonnel(),
        projectService.getAllProjects()
      ])
      setPersonnel(personnelData)
      setProjects(projectsData)
    } catch (error) {
      console.error('Veri yüklenirken hata:', error)
    }
  }

  const onSubmit = async (data: NewWorkOrderForm) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await workOrderService.createWorkOrder({
        number: `WO-${Date.now()}`, // Otomatik numara oluştur
        projectId: data.projectId,
        status: 'pending',
        priority: data.priority,
        assignedTo: data.assignedTo,
        startDate: data.startDate,
        dueDate: data.dueDate,
        description: data.description
      })
      
      onClose()
    } catch (error: any) {
      console.error('İş emri oluşturma hatası:', error)
      setError(error.message || 'İş emri oluşturulurken bir hata oluştu')
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
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="projectId" className="block text-sm font-medium mb-2">Proje</label>
              <select
                {...register('projectId', { required: 'Proje seçilmelidir' })}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Proje seçiniz...</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <span className="text-red-500 text-sm">{errors.projectId.message}</span>
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
                {personnel.map(person => (
                  <option key={person.id} value={person.id}>
                    {person.name} - {person.position}
                  </option>
                ))}
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
                <option value="urgent">Acil</option>
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