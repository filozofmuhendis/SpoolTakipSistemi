'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, X } from 'lucide-react'
import { spoolService } from '@/lib/services/spools'
import { projectService } from '@/lib/services/projects'
import { personnelService } from '@/lib/services/personnel'
import { Project, Personnel, Spool } from '@/types'
import Link from 'next/link'

const spoolSchema = z.object({
  name: z.string().min(1, 'Spool adı gereklidir'),
  projectId: z.string().min(1, 'Proje seçilmelidir'),
  status: z.enum(['pending', 'active', 'completed']).optional().default('pending'),
  assignedTo: z.string().optional(),
  quantity: z.number().min(1, 'Miktar en az 1 olmalıdır'),
  completedQuantity: z.number().min(0, 'Tamamlanan miktar 0 veya daha fazla olmalıdır').default(0),
  startDate: z.string().min(1, 'Başlangıç tarihi gereklidir'),
  endDate: z.string().optional(),
  description: z.string().optional()
})

type SpoolFormData = Omit<z.infer<typeof spoolSchema>, 'status' | 'completedQuantity'> & { status?: 'pending' | 'active' | 'completed', completedQuantity?: number }

export default function EditSpoolPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [spool, setSpool] = useState<Spool | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm<SpoolFormData>({
    resolver: zodResolver(spoolSchema),
    defaultValues: {
      status: 'pending',
      completedQuantity: 0
    }
  })

  useEffect(() => {
    loadData()
  }, [params.id])

  const loadData = async () => {
    try {
      setInitialLoading(true)
      const [spoolData, projectsData, personnelData] = await Promise.all([
        spoolService.getSpoolById(params.id),
        projectService.getAllProjects(),
        personnelService.getAllPersonnel()
      ])
      
      setSpool(spoolData)
      setProjects(projectsData)
      setPersonnel(personnelData)

      // Form verilerini doldur
      if (spoolData) {
        reset({
          name: spoolData.name,
          projectId: spoolData.projectId,
          status: spoolData.status,
          assignedTo: spoolData.assignedTo || '',
          quantity: spoolData.quantity,
          completedQuantity: spoolData.completedQuantity ?? 0,
          startDate: spoolData.startDate,
          endDate: spoolData.endDate || '',
          description: spoolData.description || ''
        })
      }
    } catch (error) {
      console.log('Veri yüklenirken hata:', error)
      setError('Spool bulunamadı veya veriler yüklenirken bir hata oluştu')
    } finally {
      setInitialLoading(false)
    }
  }

  const onSubmit = async (data: SpoolFormData) => {
    try {
      setLoading(true)
      setError(null)

      await spoolService.updateSpool(params.id, {
        name: data.name,
        projectId: data.projectId,
        status: data.status ?? 'pending',
        assignedTo: data.assignedTo,
        quantity: data.quantity,
        completedQuantity: data.completedQuantity,
        startDate: data.startDate,
        endDate: data.endDate || undefined,
        description: data.description
      })

      router.push('/spools?success=true')
    } catch (error: any) {
      setError(error.message || 'Spool güncellenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const selectedProjectId = watch('projectId')
  const selectedProject = projects.find(p => p.id === selectedProjectId)

  if (initialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Spool yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error && !spool) {
    return (
      <div className="p-6 w-full max-w-[1600px] mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
        <div className="mt-4">
          <Link href="/spools" className="btn-secondary flex items-center gap-2 w-fit">
            <ArrowLeft className="w-4 h-4" />
            Spool Listesine Dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 w-full max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/spools" className="btn-secondary flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Geri
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Spool Düzenle</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {spool?.name} spool&apos;unu düzenleyin
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Spool Adı */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Spool Adı *
              </label>
              <input
                type="text"
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Örn: SP-001, Ana Boru Hattı"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Proje */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Proje *
              </label>
              <select
                {...register('projectId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Proje seçin</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} - {project.status === 'active' ? 'Aktif' : project.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <p className="mt-1 text-sm text-red-600">{errors.projectId.message}</p>
              )}
            </div>

            {/* Durum */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Durum
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="pending">Beklemede</option>
                <option value="active">Aktif</option>
                <option value="completed">Tamamlandı</option>
              </select>
            </div>

            {/* Atanan Personel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Atanan Personel
              </label>
              <select
                {...register('assignedTo')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Personel seçin</option>
                {personnel.filter(p => p.status === 'active').map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name} - {person.position}
                  </option>
                ))}
              </select>
            </div>

            {/* Miktar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Toplam Miktar *
              </label>
              <input
                type="number"
                {...register('quantity', { valueAsNumber: true })}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="1"
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
              )}
            </div>

            {/* Tamamlanan Miktar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tamamlanan Miktar
              </label>
              <input
                type="number"
                {...register('completedQuantity', { valueAsNumber: true })}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="0"
              />
              {errors.completedQuantity && (
                <p className="mt-1 text-sm text-red-600">{errors.completedQuantity.message}</p>
              )}
            </div>

            {/* Başlangıç Tarihi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Başlangıç Tarihi *
              </label>
              <input
                type="date"
                {...register('startDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

            {/* Bitiş Tarihi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bitiş Tarihi
              </label>
              <input
                type="date"
                {...register('endDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Açıklama
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Spool hakkında detaylı açıklama..."
            />
          </div>

          {/* Seçili Proje Bilgileri */}
          {selectedProject && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Seçili Proje Bilgileri
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-600 dark:text-blue-400">Proje:</span>
                  <p className="text-blue-800 dark:text-blue-200 font-medium">{selectedProject.name}</p>
                </div>
                <div>
                  <span className="text-blue-600 dark:text-blue-400">Durum:</span>
                  <p className="text-blue-800 dark:text-blue-200 font-medium">
                    {selectedProject.status === 'active' ? 'Aktif' : 
                     selectedProject.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
                  </p>
                </div>
                <div>
                  <span className="text-blue-600 dark:text-blue-400">Başlangıç:</span>
                  <p className="text-blue-800 dark:text-blue-200 font-medium">
                    {new Date(selectedProject.startDate).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                {selectedProject.endDate && (
                  <div>
                    <span className="text-blue-600 dark:text-blue-400">Bitiş:</span>
                    <p className="text-blue-800 dark:text-blue-200 font-medium">
                      {new Date(selectedProject.endDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link href="/spools" className="btn-secondary flex items-center gap-2">
              <X className="w-4 h-4" />
              İptal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              Spool Güncelle
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 