'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Camera, Upload } from 'lucide-react'
import { inventoryService } from '@/lib/services/inventory'
import { projectService } from '@/lib/services/projects'
import { storageService } from '@/lib/services/storage'
import { Project, Inventory } from '@/types'
import Link from 'next/link'
import { useToast } from '@/components/ui/ToastProvider'
import Loading from '@/components/ui/Loading'
import ErrorState from '@/components/ui/ErrorState'

const inventorySchema = z.object({
  name: z.string().min(1, 'Malzeme adı gereklidir'),
  code: z.string().min(1, 'Malzeme kodu gereklidir'),
  category: z.string().min(1, 'Kategori gereklidir'),
  type: z.enum(['raw_material', 'finished_product', 'semi_finished', 'consumable']),
  quantity: z.number().min(0, 'Miktar 0 veya daha fazla olmalıdır'),
  unit: z.string().min(1, 'Birim gereklidir'),
  minStock: z.number().min(0, 'Minimum stok 0 veya daha fazla olmalıdır'),
  maxStock: z.number().min(0, 'Maksimum stok 0 veya daha fazla olmalıdır'),
  location: z.string().min(1, 'Konum gereklidir'),
  supplier: z.string().min(1, 'Tedarikçi gereklidir'),
  projectId: z.string().optional(),
  description: z.string().optional(),
  specifications: z.string().optional(),
  cost: z.number().min(0, 'Maliyet 0 veya daha fazla olmalıdır'),
  status: z.enum(['active', 'inactive', 'discontinued']),
  photos: z.any().optional(),
  documents: z.any().optional()
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
    setValue,
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
          name: inventoryData.name,
          code: inventoryData.code,
          category: inventoryData.category,
          type: inventoryData.type,
          quantity: inventoryData.quantity,
          unit: inventoryData.unit,
          minStock: inventoryData.minStock,
          maxStock: inventoryData.maxStock,
          location: inventoryData.location,
          supplier: inventoryData.supplier,
          projectId: inventoryData.projectId || '',
          description: inventoryData.description || '',
          specifications: inventoryData.specifications || '',
          cost: inventoryData.cost,
          status: inventoryData.status
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
      const updated = await inventoryService.updateInventory(params.id, {
        name: data.name,
        code: data.code,
        category: data.category,
        type: data.type,
        quantity: data.quantity,
        unit: data.unit,
        minStock: data.minStock,
        maxStock: data.maxStock,
        location: data.location,
        supplier: data.supplier,
        projectId: data.projectId || undefined,
        description: data.description || undefined,
        specifications: data.specifications || undefined,
        cost: data.cost,
        status: data.status
      })

      // Fotoğraf ve belgeleri yükle
      const filesToUpload: File[] = [
        ...(data.photos ? Array.from(data.photos as FileList) : []),
        ...(data.documents ? Array.from(data.documents as FileList) : [])
      ]

      for (const file of filesToUpload) {
        const uploaded = await storageService.uploadFile(file, 'inventory', params.id)
        if (uploaded) {
          showToast({ type: 'success', message: `${file.name} yüklendi!` })
        } else {
          showToast({ type: 'error', message: `${file.name} yüklenemedi!` })
        }
      }

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
                  Malzeme Kodu *
                </label>
                <input
                  type="text"
                  {...register('code')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Malzeme kodunu giriniz"
                />
                {errors.code && (
                  <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kategori *
                </label>
                <input
                  type="text"
                  {...register('category')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Örn: Çelik, Plastik, Elektronik"
                />
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Malzeme Türü *
                </label>
                <select
                  {...register('type')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Tür seçiniz</option>
                  <option value="raw_material">Hammadde</option>
                  <option value="finished_product">Bitmiş Ürün</option>
                  <option value="semi_finished">Yarı Mamul</option>
                  <option value="consumable">Sarf Malzemesi</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Stok Bilgileri */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stok Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                  Birim *
                </label>
                <input
                  type="text"
                  {...register('unit')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Örn: kg, adet, metre"
                />
                {errors.unit && (
                  <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Stok *
                </label>
                <input
                  type="number"
                  {...register('minStock', { valueAsNumber: true })}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="0"
                />
                {errors.minStock && (
                  <p className="mt-1 text-sm text-red-600">{errors.minStock.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maksimum Stok *
                </label>
                <input
                  type="number"
                  {...register('maxStock', { valueAsNumber: true })}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="100"
                />
                {errors.maxStock && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxStock.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Konum ve Tedarikçi */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Konum ve Tedarikçi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  Tedarikçi *
                </label>
                <input
                  type="text"
                  {...register('supplier')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Tedarikçi firma adı"
                />
                {errors.supplier && (
                  <p className="mt-1 text-sm text-red-600">{errors.supplier.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Maliyet ve Proje */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Maliyet ve Proje</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Birim Maliyet (₺) *
                </label>
                <input
                  type="number"
                  {...register('cost', { valueAsNumber: true })}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="0.00"
                />
                {errors.cost && (
                  <p className="mt-1 text-sm text-red-600">{errors.cost.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Proje (Opsiyonel)
                </label>
                <select
                  {...register('projectId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Proje seçiniz</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Açıklamalar */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Açıklamalar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  Teknik Özellikler
                </label>
                <textarea
                  {...register('specifications')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Teknik özellikler ve detaylar"
                />
              </div>
            </div>
          </div>

          {/* Durum */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Durum</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Malzeme Durumu
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
                <option value="discontinued">Kullanımdan Kaldırıldı</option>
              </select>
            </div>
          </div>

          {/* Dosya Yükleme */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Dosyalar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Camera className="w-4 h-4 inline mr-2" />
                  Fotoğraflar
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  {...register('photos')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Upload className="w-4 h-4 inline mr-2" />
                  Belgeler
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  multiple
                  {...register('documents')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Kaydet Butonu */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Link href={`/inventory/${params.id}`} className="btn-secondary">
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
