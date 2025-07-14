'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, X } from 'lucide-react'
import { projectService } from '@/lib/services/projects'
import { personnelService } from '@/lib/services/personnel'
import { Personnel } from '@/types'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

const projectSchema = z.object({
  name: z.string().min(3, 'Proje adı en az 3 karakter olmalıdır').max(100, 'Proje adı en fazla 100 karakter olabilir'),
  description: z.string().max(500, 'Açıklama en fazla 500 karakter olabilir').optional(),
  startDate: z.string().min(1, 'Başlangıç tarihi gereklidir')
    .refine(date => !isNaN(Date.parse(date)), 'Geçerli bir tarih giriniz'),
  endDate: z.string()
    .refine(date => !date || !isNaN(Date.parse(date)), 'Geçerli bir tarih giriniz')
    .refine(date => !date || new Date(date) > new Date(), 'Bitiş tarihi gelecekte olmalıdır')
    .optional(),
  managerId: z.string().min(1, 'Proje yöneticisi seçilmelidir'),
  status: z.enum(['active', 'pending', 'completed']).optional().default('pending')
})

type ProjectFormData = Omit<z.infer<typeof projectSchema>, 'status'> & { status?: 'active' | 'pending' | 'completed' }

export default function NewProjectPage() {
  const [loading, setLoading] = useState(false)
  const [personnel, setPersonnel] = useState<any[]>([])
  const [spoolFile, setSpoolFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      status: 'pending'
    }
  })

  const loadPersonnel = async () => {
    try {
      const personnelData = await personnelService.getAllPersonnel()
      setPersonnel(personnelData)
    } catch (error) {
      console.log('Personel yüklenirken hata:', error)
    }
  }

  useEffect(() => {
    personnelService.getManagers().then(setPersonnel)
  }, [])

  const onSubmit = async (data: ProjectFormData) => {
    try {
      setLoading(true)
      setError(null)
      // 1. Proje kaydını oluştur
      const project = await projectService.createProject({
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate || undefined,
        managerId: data.managerId,
        status: data.status ?? 'pending',
        priority: 'medium'
      })
      // 2. Spool dosyası varsa storage'a yükle ve documents tablosuna kaydet
      if (spoolFile && project.id && user?.id) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(`project/${project.id}/spool-list/${spoolFile.name}`, spoolFile)
        if (!uploadError && uploadData) {
          await supabase
            .from('documents')
            .insert({
              project_id: project.id,
              name: spoolFile.name,
              file_url: uploadData.path,
              created_by: user.id
            })
        }
      }
      router.push('/projects')
    } catch (error: any) {
      setError(error.message || 'Proje oluşturulurken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 w-full max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/projects" className="btn-secondary flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Geri
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Yeni Proje</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Yeni proje oluşturun</p>
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
            {/* Proje Adı */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Proje Adı *
              </label>
              <input
                type="text"
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Proje adını girin"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Proje Yöneticisi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Proje Yöneticisi *
              </label>
              <select
                {...register('managerId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Yönetici seçin</option>
                {personnel.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
              {errors.managerId && (
                <p className="mt-1 text-sm text-red-600">{errors.managerId.message}</p>
              )}
            </div>

            {/* Spool Listesi Excel Yükleme Alanı */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Spool Listesi (Excel)
              </label>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={e => setSpoolFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
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

          {/* Açıklama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Açıklama
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Proje açıklamasını girin"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link href="/projects" className="btn-secondary flex items-center gap-2">
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
              Proje Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
