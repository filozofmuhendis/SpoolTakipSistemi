'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { inventoryService } from '@/lib/services/inventory'
import { projectService } from '@/lib/services/projects'
import { Project, Inventory } from '@/types'
import Link from 'next/link'
import { useToast } from '@/components/ui/ToastProvider'
import Loading from '@/components/ui/Loading'
import ErrorState from '@/components/ui/ErrorState'

const inventorySchema = z.object({
  name: z.string().min(1, 'Malzeme adı gereklidir'),
  description: z.string().optional(),
  quantity: z.number().min(0, 'Miktar 0 veya daha fazla olmalıdır'),
  location: z.string().min(1, 'Konum gereklidir'),
  notes: z.string().optional()
})

type InventoryFormData = z.infer<typeof inventorySchema>

export default function EditInventoryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [inventory, setInventory] = useState<Inventory | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const { showToast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema)
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [inventoryData, projectsData] = await Promise.all([
          inventoryService.getInventoryById(params.id),
          projectService.getAllProjects()
        ])

        if (!inventoryData) {
          throw new Error('Envanter öğesi bulunamadı')
        }

        setInventory(inventoryData)
        setProjects(projectsData)

        // Form değerlerini doldur
        reset({
          name: inventoryData.name || '',
          description: inventoryData.description || '',
          quantity: inventoryData.quantity || 0,
          location: inventoryData.location || '',
          notes: inventoryData.notes || ''
        })
      } catch (error: any) {
        console.error('Veri yükleme hatası:', error)
        showToast({ type: 'error', message: error.message || 'Veri yüklenirken bir hata oluştu' })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id, reset, showToast])

  const onSubmit = async (data: InventoryFormData) => {
    setSaving(true)
    try {
      await inventoryService.updateInventory(params.id, {
        name: data.name,
        description: data.description || undefined,
        quantity: data.quantity,
        location: data.location,
        notes: data.notes || undefined
      })

      showToast({ type: 'success', message: 'Malzeme başarıyla güncellendi!' })
      router.push(`/inventory/${params.id}`)
    } catch (error: any) {
      console.error('Malzeme güncelleme hatası:', error)
      showToast({ type: 'error', message: error.message || 'Malzeme güncellenirken bir hata oluştu' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading />
  if (!inventory) return <ErrorState title="Envanter öğesi bulunamadı" description="Aradığınız envanter öğesi mevcut değil." />

  return (
    <div className="p-6 w-full max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Link href={`/inventory/${params.id}`} className="mr-4 btn-secondary flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          Geri
        </Link>
        <h1 className="text-2xl font-bold">Malzeme Düzenle</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Temel Bilgiler */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Temel Bilgiler</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Malzeme Adı *
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Malzeme adını giriniz"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Açıklama
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Malzeme hakkında genel açıklama"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mevcut Miktar *
                </label>
                <input
                  type="number"
                  {...register('quantity', { valueAsNumber: true })}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="0"
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Depo Konumu *
                </label>
                <input
                  type="text"
                  {...register('location')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Örn: A Blok, Raf 3"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notlar
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Ek notlar veya açıklamalar"
                />
              </div>
            </div>
          </div>

          {/* Butonlar */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link
              href={`/inventory/${params.id}`}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              İptal
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
