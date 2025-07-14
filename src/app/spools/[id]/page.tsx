'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Package } from 'lucide-react'
import { spoolService } from '@/lib/services/spools'
import { projectService } from '@/lib/services/projects'
import { UrunAltKalemi, Project } from '@/types'
import Link from 'next/link'

export default function SpoolDetailPage({ params }: { params: { id: string } }) {
  const [spool, setSpool] = useState<UrunAltKalemi | null>(null)
  const [project, setProject] = useState<Project | null>(null)
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
      
      if (spoolData?.project_id) {
        const projectData = await projectService.getProjectById(spoolData.project_id)
        setProject(projectData)
      }
    } catch (error) {
      console.log('Spool yüklenirken hata:', error)
      setError('Spool yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

      const handleDeleteSpool = async () => {
      if (confirm('Bu ürün alt kalemini silmek istediğinizden emin misiniz?')) {
        try {
          await spoolService.deleteSpool(params.id)
          router.push('/spools?deleted=true')
        } catch (error) {
          console.log('Ürün alt kalemi silme hatası:', error)
          setError('Ürün alt kalemi silinirken bir hata oluştu')
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ürün alt kalemi yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error || !spool) {
    return (
      <div className="p-6 w-full max-w-[1600px] mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error || 'Ürün alt kalemi bulunamadı'}
        </div>
        <div className="mt-4">
          <Link href="/spools" className="btn-secondary flex items-center gap-2 w-fit">
            <ArrowLeft className="w-4 h-4" />
            Ürün Alt Kalemi Listesine Dön
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
              Ürün alt kalemi detayları
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
                  Ürün Alt Kalemi Adı
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{spool.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Durum
                </label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(spool.status || 'unknown')}`}>
                  {getStatusText(spool.status || 'unknown')}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Proje
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {project?.name || 'Bilinmiyor'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Malzeme
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{spool.material}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Çap
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{spool.diameter}</p>
              </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Kalınlık
                  </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{spool.thickness}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Uzunluk
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{spool.length}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Ağırlık
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{spool.weight}</p>
              </div>
            </div>
          </div>

          {/* Notlar */}
          {spool.notes && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Notlar</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{spool.notes}</p>
            </div>
          )}
        </div>

        {/* Yan Panel */}
        <div className="space-y-6">
          {/* Hızlı İstatistikler */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Ürün Alt Kalemi Bilgileri</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Malzeme</p>
                  <p className="font-medium">{spool.material}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-xs font-bold">Ø</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Çap</p>
                  <p className="font-medium">{spool.diameter}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-xs font-bold">T</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Kalınlık</p>
                  <p className="font-medium">{spool.thickness}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-xs font-bold">L</span>
            </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Uzunluk</p>
                  <p className="font-medium">{spool.length}</p>
          </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-xs font-bold">W</span>
                </div>
              <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ağırlık</p>
                  <p className="font-medium">{spool.weight}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 