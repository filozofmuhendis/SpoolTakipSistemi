'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Upload, File, Trash2 } from 'lucide-react'
import { inventoryService } from '@/lib/services/inventory'
import { projectService } from '@/lib/services/projects'
import { storageService } from '@/lib/services/storage'
import { Project } from '@/types'
import Link from 'next/link'
import { useToast } from '@/components/ui/ToastProvider'

const inventorySchema = z.object({
  name: z.string().min(3, 'Ürün adı en az 3 karakter olmalı').max(100, 'Ürün adı en fazla 100 karakter olabilir'),
  category: z.string().min(1, 'Kategori seçiniz'),
  type: z.enum(['raw_material', 'finished_product', 'semi_finished', 'consumable']),
  quantity: z.number().min(0, 'Miktar 0\'dan küçük olamaz').max(1000000, 'Miktar çok yüksek'),
  unit: z.string().min(1, 'Birim seçiniz'),
  location: z.string().min(2, 'Konum en az 2 karakter olmalı').max(100, 'Konum en fazla 100 karakter olabilir'),
  supplier: z.string().min(1, 'Tedarikçi adı gereklidir'),
  cost: z.number().min(0, 'Maliyet 0\'dan küçük olamaz').optional(),
  description: z.string().max(500, 'Açıklama en fazla 500 karakter olabilir').optional(),
  notes: z.string().max(500, 'Notlar en fazla 500 karakter olabilir').optional(),
  created_by: z.string().optional()
})

type InventoryFormData = z.infer<typeof inventorySchema>

export default function NewInventoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [_projects, setProjects] = useState<Project[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue: _setValue,
    watch: _watch
  } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: '',
      category: '',
      type: 'raw_material' as const,
      quantity: 0,
      unit: '',
      location: '',
      supplier: '',
      cost: 0,
      description: '',
      notes: '',
      created_by: ''
    }
  })

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await projectService.getAllProjects()
        setProjects(data)
      } catch (error) {
        console.log('Projeler yüklenirken hata:', error)
      }
    }
    loadProjects()
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Dosya tipi ve boyut kontrolü
    const validFiles = files.filter(file => {
      const allowedTypes = ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      const maxSize = 5 * 1024 * 1024 // 5MB
      
      if (!storageService.isValidFileType(file, allowedTypes)) {
        showToast({ type: 'error', message: `${file.name} dosya tipi desteklenmiyor.` })
        return false
      }
      
      if (!storageService.isValidFileSize(file, maxSize)) {
        showToast({ type: 'error', message: `${file.name} dosyası çok büyük. Maksimum 5MB olmalı.` })
        return false
      }
      
      return true
    })
    
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async (inventoryId: string) => {
    const uploadPromises = selectedFiles.map(async (file) => {
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
      
      try {
        const uploadedFile = await storageService.uploadFile(file, 'inventory', inventoryId)
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
        return uploadedFile
      } catch (error) {
        console.log('Dosya yükleme hatası:', error)
        setUploadProgress(prev => ({ ...prev, [file.name]: -1 }))
        return null
      }
    })

    const results = await Promise.all(uploadPromises)
    const successfulUploads = results.filter(result => result !== null)
    
    if (successfulUploads.length > 0) {
      showToast({ type: 'success', message: `${successfulUploads.length} dosya başarıyla yüklendi.` })
    }
    
    // Progress'i temizle
    setTimeout(() => {
      setUploadProgress({})
    }, 3000)
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <File className="w-4 h-4 text-green-500" />
    if (fileType === 'application/pdf') return <File className="w-4 h-4 text-red-500" />
    return <File className="w-4 h-4 text-blue-500" />
  }

  const onSubmit: SubmitHandler<InventoryFormData> = async (data) => {
    setLoading(true)
    try {
      const inventoryData: any = {
        name: data.name,
        category: data.category,
        type: data.type,
        quantity: data.quantity,
        unit: data.unit,
        location: data.location,
        supplier: data.supplier
      }
      
      if (data.cost) inventoryData.cost = data.cost
      if (data.description) inventoryData.description = data.description
      if (data.notes) inventoryData.notes = data.notes
      if (data.created_by) inventoryData.created_by = data.created_by
      
      const newInventory = await inventoryService.createInventory(inventoryData)

      // Malzeme oluşturulduktan sonra dosyaları yükle
      if (newInventory && selectedFiles.length > 0) {
        await uploadFiles(newInventory.id)
      }

      showToast({ type: 'success', message: 'Malzeme başarıyla eklendi!' })
      router.push('/inventory')
    } catch (error: any) {
      console.log('Malzeme ekleme hatası:', error)
      showToast({ type: 'error', message: error.message || 'Malzeme eklenirken bir hata oluştu' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 w-full max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Link href="/inventory" className="mr-4 btn-secondary flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          Geri
        </Link>
        <h1 className="text-2xl font-bold">Yeni Malzeme Ekle</h1>
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
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Malzeme adını giriniz"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kategori *
                </label>
                <select
                  {...register('category')}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Kategori seçiniz</option>
                  <option value="metal">Metal</option>
                  <option value="plastic">Plastik</option>
                  <option value="electronic">Elektronik</option>
                  <option value="chemical">Kimyasal</option>
                  <option value="textile">Tekstil</option>
                  <option value="general">Genel</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tip *
                </label>
                <select
                  {...register('type')}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="raw_material">Ham Madde</option>
                  <option value="finished_product">Bitmiş Ürün</option>
                  <option value="semi_finished">Yarı Mamul</option>
                  <option value="consumable">Sarf Malzeme</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Birim *
                </label>
                <select
                  {...register('unit')}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Birim seçiniz</option>
                  <option value="adet">Adet</option>
                  <option value="kg">Kilogram</option>
                  <option value="m">Metre</option>
                  <option value="m2">Metrekare</option>
                  <option value="m3">Metreküp</option>
                  <option value="lt">Litre</option>
                  <option value="ton">Ton</option>
                </select>
                {errors.unit && (
                  <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
                )}
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
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tedarikçi adını giriniz"
                />
                {errors.supplier && (
                  <p className="mt-1 text-sm text-red-600">{errors.supplier.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Birim Maliyet
                </label>
                <input
                  type="number"
                  {...register('cost', { valueAsNumber: true })}
                  min="0"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
                {errors.cost && (
                  <p className="mt-1 text-sm text-red-600">{errors.cost.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Açıklama
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Malzeme hakkında genel açıklama"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notlar
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Ek notlar veya açıklamalar"
                />
              </div>
            </div>
          </div>

          {/* Dosya Seçme Alanı */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Dosyalar</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Dosyaları seçmek için{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    tıklayın
                  </button>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Maksimum 10 dosya, 5MB boyutunda (Resim, PDF, Word)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Seçilen Dosyalar */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">
                Seçilen Dosyalar ({selectedFiles.length})
              </h4>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                  >
                    <div className="flex items-center space-x-2">
                      {getFileIcon(file.type)}
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({storageService.formatFileSize(file.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Yükleme İlerlemesi */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Dosya Yükleme İlerlemesi</h4>
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {fileName}
                    </span>
                    <span className="text-sm text-gray-500">
                      {progress === -1 ? 'Hata' : `${progress}%`}
                    </span>
                  </div>
                  {progress !== -1 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Butonlar */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/inventory"
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
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
