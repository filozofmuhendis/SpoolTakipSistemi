'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Package, MapPin, DollarSign, AlertTriangle, TrendingUp, Calendar, User } from 'lucide-react'
import { inventoryService } from '@/lib/services/inventory'
import { Inventory } from '@/types'
import Link from 'next/link'
import Loading from '@/components/ui/Loading'
import ErrorState from '@/components/ui/ErrorState'
import { useToast } from '@/components/ui/ToastProvider'

export default function InventoryDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [inventory, setInventory] = useState<Inventory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
    } catch (error: any) {
      console.error('Envanter yükleme hatası:', error)
      setError(error.message || 'Envanter yüklenirken bir hata oluştu')
      showToast({ type: 'error', message: 'Envanter yüklenirken bir hata oluştu' })
    } finally {
      setLoading(false)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'discontinued': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'raw_material': return 'bg-blue-100 text-blue-800'
      case 'finished_product': return 'bg-green-100 text-green-800'
      case 'semi_finished': return 'bg-yellow-100 text-yellow-800'
      case 'consumable': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity <= minStock) return 'bg-red-100 text-red-800'
    if (quantity <= minStock * 1.5) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'raw_material': return 'Hammadde'
      case 'finished_product': return 'Bitmiş Ürün'
      case 'semi_finished': return 'Yarı Mamul'
      case 'consumable': return 'Sarf Malzemesi'
      default: return type
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif'
      case 'inactive': return 'Pasif'
      case 'discontinued': return 'Kullanımdan Kaldırıldı'
      default: return status
    }
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
                  Malzeme Kodu
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {inventory.code}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Kategori
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {inventory.category}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Malzeme Türü
                </label>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getTypeColor(inventory.type)}`}>
                  {getTypeLabel(inventory.type)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Durum
                </label>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(inventory.status)}`}>
                  {getStatusLabel(inventory.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Stok Bilgileri */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Stok Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Mevcut Stok
                </label>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {inventory.quantity} {inventory.unit}
                  </p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatus(inventory.quantity, inventory.minStock)}`}>
                    {inventory.quantity <= inventory.minStock ? 'Düşük' : 'Normal'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Stok Aralığı
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {inventory.minStock} - {inventory.maxStock} {inventory.unit}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Birim Maliyet
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  ₺{inventory.cost.toLocaleString()}/{inventory.unit}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Toplam Değer
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  ₺{(inventory.quantity * inventory.cost).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Konum ve Tedarikçi */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Konum ve Tedarikçi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Depo Konumu
                </label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {inventory.location}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Tedarikçi
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {inventory.supplier}
                </p>
              </div>
            </div>
          </div>

          {/* Açıklamalar */}
          {(inventory.description || inventory.specifications) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Açıklamalar</h2>
              <div className="space-y-4">
                {inventory.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Genel Açıklama
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {inventory.description}
                    </p>
                  </div>
                )}
                {inventory.specifications && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Teknik Özellikler
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {inventory.specifications}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Yan Panel */}
        <div className="space-y-6">
          {/* Proje Bilgisi */}
          {inventory.projectId && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Proje Bilgisi</h3>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Proje
                </label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {inventory.projectName || 'Bilinmeyen Proje'}
                </p>
              </div>
            </div>
          )}

          {/* İstatistikler */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">İstatistikler</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Stok Oranı</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {((inventory.quantity / inventory.maxStock) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min((inventory.quantity / inventory.maxStock) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Güvenlik Stoku</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {inventory.minStock} {inventory.unit}
                </span>
              </div>
            </div>
          </div>

          {/* Tarih Bilgileri */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Tarih Bilgileri</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Son Güncelleme
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(inventory.lastUpdated).toLocaleDateString('tr-TR')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Oluşturulma Tarihi
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(inventory.createdAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>
          </div>

          {/* Hızlı İşlemler */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Hızlı İşlemler</h3>
            <div className="space-y-2">
              <button className="w-full btn-secondary text-sm">
                Stok Güncelle
              </button>
              <button className="w-full btn-secondary text-sm">
                Tedarik Talebi Oluştur
              </button>
              <button className="w-full btn-secondary text-sm">
                Hareket Geçmişi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
