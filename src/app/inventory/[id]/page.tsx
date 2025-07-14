'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Package, MapPin, Calendar, User, File, Download, Eye } from 'lucide-react'
import { inventoryService } from '@/lib/services/inventory'
import { storageService } from '@/lib/services/storage'
import { Inventory } from '@/types'
import { FileUpload } from '@/lib/services/storage'
import Link from 'next/link'
import Loading from '@/components/ui/Loading'
import ErrorState from '@/components/ui/ErrorState'
import { useToast } from '@/components/ui/ToastProvider'

export default function InventoryDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [inventory, setInventory] = useState<Inventory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [files, setFiles] = useState<FileUpload[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    loadInventory()
  }, [params.id])

  const loadInventory = async () => {
    try {
      setLoading(true)
      const data = await inventoryService.getInventoryById(params.id)
      if (!data) {
        setError('Envanter öğesi bulunamadı')
        return
      }
      setInventory(data)
      
      // Dosyaları yükle
      await loadFiles()
    } catch (error: any) {
      console.error('Envanter yükleme hatası:', error)
      setError(error.message || 'Envanter yüklenirken bir hata oluştu')
      showToast({ type: 'error', message: 'Envanter yüklenirken bir hata oluştu' })
    } finally {
      setLoading(false)
    }
  }

  const loadFiles = async () => {
    try {
      setLoadingFiles(true)
      const filesData = await storageService.getFilesByEntity('inventory', params.id)
      setFiles(filesData)
    } catch (error) {
      console.error('Dosya yükleme hatası:', error)
    } finally {
      setLoadingFiles(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bu envanter öğesini silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      await inventoryService.deleteInventory(params.id)
      showToast({ type: 'success', message: 'Envanter öğesi silindi' })
      router.push('/inventory')
    } catch (error: any) {
      console.error('Silme hatası:', error)
      showToast({ type: 'error', message: 'Silme sırasında bir hata oluştu' })
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <File className="w-4 h-4 text-green-500" />
    if (fileType === 'application/pdf') return <File className="w-4 h-4 text-red-500" />
    return <File className="w-4 h-4 text-blue-500" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) return <Loading />
  if (error) return <ErrorState title="Hata" description={error} />
  if (!inventory) return <ErrorState title="Envanter öğesi bulunamadı" description="Aradığınız envanter öğesi mevcut değil." />

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link href="/inventory" className="mr-4 btn-secondary flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Geri
          </Link>
          <h1 className="text-2xl font-bold">{inventory.name}</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/inventory/${inventory.id}/edit`}
            className="btn-primary flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Düzenle
          </Link>
          <button
            onClick={handleDelete}
            className="btn-danger flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Sil
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ana Bilgiler */}
        <div className="lg:col-span-2 space-y-6">
          {/* Temel Bilgiler */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Temel Bilgiler</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Malzeme Adı
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {inventory.name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Lokasyon
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {inventory.location || 'Belirtilmemiş'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Mevcut Miktar
                </label>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {inventory.quantity?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Açıklama */}
          {inventory.description && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Açıklama</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {inventory.description}
              </p>
            </div>
          )}

          {/* Notlar */}
          {inventory.notes && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Notlar</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {inventory.notes}
              </p>
            </div>
          )}

          {/* Dosyalar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Dosyalar</h2>
            {loadingFiles ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-sm text-gray-600">Dosyalar yükleniyor...</span>
              </div>
            ) : files.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        {getFileIcon(file.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {storageService.formatFileSize(file.size)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(file.uploadedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 btn-secondary flex items-center justify-center gap-1 text-sm"
                        title="Görüntüle"
                      >
                        <Eye className="w-3 h-3" />
                        Görüntüle
                      </a>
                      <a
                        href={file.url}
                        download={file.name}
                        className="flex-1 btn-primary flex items-center justify-center gap-1 text-sm"
                        title="İndir"
                      >
                        <Download className="w-3 h-3" />
                        İndir
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <File className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>Bu malzeme için henüz dosya yüklenmemiş.</p>
              </div>
            )}
          </div>
        </div>

        {/* Yan Panel */}
        <div className="space-y-6">
          {/* Hızlı İstatistikler */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Hızlı Bilgiler</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Miktar</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {inventory.quantity?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Lokasyon</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {inventory.location || 'Belirtilmemiş'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <File className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Dosyalar</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {files.length} dosya
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* İşlemler */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">İşlemler</h3>
            <div className="space-y-3">
              <Link
                href={`/inventory/${inventory.id}/edit`}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Düzenle
              </Link>
              <button
                onClick={handleDelete}
                className="w-full btn-danger flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Sil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
