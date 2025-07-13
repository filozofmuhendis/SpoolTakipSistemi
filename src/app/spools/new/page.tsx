'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, X } from 'lucide-react'
import { spoolService } from '@/lib/services/spools'
import { projectService } from '@/lib/services/projects'
import { Project } from '@/types'
import Link from 'next/link'

const spoolSchema = z.object({
  name: z.string().min(1, 'Ürün alt kalemi adı gereklidir'),
  project_id: z.string().min(1, 'Proje seçilmelidir'),
  material: z.string().min(1, 'Malzeme gereklidir'),
  diameter: z.string().min(1, 'Çap gereklidir'),
  thickness: z.string().min(1, 'Kalınlık gereklidir'),
  length: z.string().min(1, 'Uzunluk gereklidir'),
  weight: z.string().min(1, 'Ağırlık gereklidir'),
  status: z.enum(['pending', 'active', 'completed']),
  notes: z.string().optional()
})

type SpoolFormData = z.infer<typeof spoolSchema>

export default function NewSpoolPage() {
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
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
      status: 'pending'
    }
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const projectsData = await projectService.getAllProjects()
      setProjects(projectsData)
    } catch (error) {
      console.log('Veri yüklenirken hata:', error)
      setError('Veriler yüklenirken bir hata oluştu')
    }
  }

  const onSubmit = async (data: SpoolFormData) => {
    try {
      setLoading(true)
      setError(null)

      await spoolService.createSpool({
        name: data.name,
        project_id: data.project_id,
        material: data.material,
        diameter: parseFloat(data.diameter) || 0,
        thickness: parseFloat(data.thickness) || 0,
        length: parseFloat(data.length) || 0,
        weight: parseFloat(data.weight) || 0,
        status: data.status,
        notes: data.notes
      })

      router.push('/spools?success=true')
    } catch (error: any) {
      setError(error.message || 'Ürün alt kalemi oluşturulurken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const selectedProjectId = watch('project_id')
  const selectedProject = projects.find(p => p.id === selectedProjectId)

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
            <h1 className="text-3xl font-bold">Yeni Ürün Alt Kalemi</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Yeni ürün alt kalemi oluşturun</p>
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
            {/* Ürün Alt Kalemi Adı */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ürün Alt Kalemi Adı *
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
                {...register('project_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Proje seçin</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {errors.project_id && (
                <p className="mt-1 text-sm text-red-600">{errors.project_id.message}</p>
              )}
            </div>

            {/* Malzeme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Malzeme *
              </label>
              <input
                type="text"
                {...register('material')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Örn: Çelik, Paslanmaz Çelik"
              />
              {errors.material && (
                <p className="mt-1 text-sm text-red-600">{errors.material.message}</p>
              )}
            </div>

            {/* Çap */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Çap *
              </label>
              <input
                type="text"
                {...register('diameter')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Örn: 50mm, 2 inch"
              />
              {errors.diameter && (
                <p className="mt-1 text-sm text-red-600">{errors.diameter.message}</p>
              )}
            </div>

            {/* Kalınlık */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kalınlık *
              </label>
              <input
                type="text"
                {...register('thickness')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Örn: 3mm, 0.125 inch"
              />
              {errors.thickness && (
                <p className="mt-1 text-sm text-red-600">{errors.thickness.message}</p>
              )}
            </div>

            {/* Uzunluk */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Uzunluk *
              </label>
              <input
                type="text"
                {...register('length')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Örn: 5m, 16.4 ft"
              />
              {errors.length && (
                <p className="mt-1 text-sm text-red-600">{errors.length.message}</p>
              )}
            </div>

            {/* Ağırlık */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ağırlık *
              </label>
              <input
                type="text"
                {...register('weight')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Örn: 25kg, 55 lbs"
              />
              {errors.weight && (
                <p className="mt-1 text-sm text-red-600">{errors.weight.message}</p>
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
          </div>

          {/* Notlar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notlar
            </label>
            <textarea
              {...register('notes')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Spool hakkında ek bilgiler..."
            />
          </div>

          {/* Butonlar */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/spools"
              className="btn-secondary flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              İptal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
                <Save className="w-4 h-4" />
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 
