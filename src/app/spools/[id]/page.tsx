'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Calendar, User, Package, TrendingUp, AlertCircle } from 'lucide-react'
import { spoolService } from '@/lib/services/spools'
import { Spool } from '@/types'
import Link from 'next/link'

export default function SpoolDetailPage({ params }: { params: { id: string } }) {
  const [spool, setSpool] = useState<Spool | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadSpool()
  }, [params.id])

  const loadSpool = async () => {
    try {
      setLoading(true)
      const spoolData = await spoolService.getSpoolById(params.id)
      setSpool(spoolData)
    } catch (error) {
      console.error('Spool yüklenirken hata:', error)
      setError('Spool bulunamadı')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSpool = async () => {
    if (confirm('Bu spool\'u silmek istediğinizden emin misiniz?')) {
      try {
        await spoolService.deleteSpool(params.id)
        router.push('/spools?deleted=true')
      } catch (error) {
        console.error('Spool silme hatası:', error)
        alert('Spool silinirken bir hata oluştu')
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Beklemede'
      case 'active': return 'Aktif'
      case 'completed': return 'Tamamlandı'
      default: return 'Bilinmiyor'
    }
  }

  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0
    return Math.round((completed / total) * 100)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 75) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Spool yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error || !spool) {
    return (
      <div className="p-6 w-full max-w-[1600px] mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error || 'Spool bulunamadı'}
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
            <h1 className="text-3xl font-bold">{spool.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Spool detayları ve ilerleme durumu
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/spools/${spool.id}/edit`} className="btn-primary flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Düzenle
          </Link>
          <button 
            onClick={handleDeleteSpool}
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
                  Spool Adı
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{spool.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Durum
                </label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(spool.status)}`}>
                  {getStatusText(spool.status)}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Proje
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{spool.projectName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Atanan Personel
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {spool.assignedToName || 'Atanmamış'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Başlangıç Tarihi
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {new Date(spool.startDate).toLocaleDateString('tr-TR')}
                </p>
              </div>

              {spool.endDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Bitiş Tarihi
                  </label>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {new Date(spool.endDate).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* İlerleme Durumu */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">İlerleme Durumu</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tamamlanan: {spool.completedQuantity} / {spool.quantity}
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  %{getProgressPercentage(spool.completedQuantity, spool.quantity)}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-300 ${getProgressColor(getProgressPercentage(spool.completedQuantity, spool.quantity))}`}
                  style={{ width: `${getProgressPercentage(spool.completedQuantity, spool.quantity)}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {spool.quantity}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Toplam Miktar</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {spool.completedQuantity}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">Tamamlanan</div>
                </div>
              </div>
            </div>
          </div>

          {/* Açıklama */}
          {spool.description && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Açıklama</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {spool.description}
              </p>
            </div>
          )}
        </div>

        {/* Yan Panel */}
        <div className="space-y-6">
          {/* Hızlı İstatistikler */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Hızlı İstatistikler</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Durum</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(spool.status)}`}>
                  {getStatusText(spool.status)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">İlerleme</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  %{getProgressPercentage(spool.completedQuantity, spool.quantity)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Kalan</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {spool.quantity - spool.completedQuantity}
                </span>
              </div>
            </div>
          </div>

          {/* Tarih Bilgileri */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Tarih Bilgileri
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Oluşturulma
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(spool.createdAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Son Güncelleme
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(spool.updatedAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>
          </div>

          {/* Hızlı İşlemler */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Hızlı İşlemler</h3>
            <div className="space-y-3">
              <Link 
                href={`/spools/${spool.id}/edit`}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Düzenle
              </Link>
              
              <button 
                onClick={handleDeleteSpool}
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