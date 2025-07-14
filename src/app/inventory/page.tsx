'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Package, AlertTriangle, TrendingUp, MapPin, DollarSign } from 'lucide-react'
import { inventoryService } from '@/lib/services/inventory'
import { Inventory } from '@/types'
import Link from 'next/link'
import Loading from '@/components/ui/Loading'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import { useToast } from '@/components/ui/ToastProvider'

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Inventory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { showToast } = useToast()

  useEffect(() => {
    loadInventory()
  }, [])

  const loadInventory = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await inventoryService.getAllInventory()
      setInventory(data)
    } catch (error: any) {
      console.log('Envanter yükleme hatası:', error)
      setError('Envanter yüklenirken bir hata oluştu')
      showToast({ type: 'error', message: 'Envanter yüklenirken bir hata oluştu' })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    // Client-side filtreleme zaten yapılıyor
    // Bu fonksiyon sadece UI için kullanılıyor
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu envanter öğesini silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      await inventoryService.deleteInventory(id)
      showToast({ type: 'success', message: 'Envanter öğesi silindi' })
      loadInventory()
    } catch (error: any) {
      console.log('Silme hatası:', error)
      showToast({ type: 'error', message: 'Silme sırasında bir hata oluştu' })
    }
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (loading) return <Loading />
  if (error) return <ErrorState title="Hata" description={error} />

  // Veri yoksa boş durum göster
  if (filteredInventory.length === 0) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Envanter Yönetimi</h1>
          <Link href="/inventory/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Yeni Malzeme
          </Link>
        </div>
        <EmptyState 
          title="Envanter bulunamadı"
          description={searchTerm 
            ? "Arama kriterlerinize uygun malzeme bulunamadı." 
            : "Henüz hiç malzeme eklenmemiş."}
        />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Envanter Yönetimi</h1>
        <Link href="/inventory/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Yeni Malzeme
        </Link>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Malzeme</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{filteredInventory.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Miktar</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {filteredInventory.reduce((sum, item) => sum + (item.quantity || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Lokasyonlar</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {Array.from(new Set(filteredInventory.map(item => item.location).filter(Boolean))).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Arama ve Filtreler */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Malzeme adı, açıklama veya lokasyon ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
            <button
            onClick={handleSearch}
            className="btn-primary flex items-center gap-2"
            >
            <Search className="w-4 h-4" />
            Ara
            </button>
        </div>
      </div>

      {/* Envanter Tablosu */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Malzeme
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Miktar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Lokasyon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Açıklama
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {item.quantity?.toLocaleString() || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {item.location || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {item.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/inventory/${item.id}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Görüntüle
                      </Link>
                      <Link
                        href={`/inventory/${item.id}/edit`}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      >
                        Düzenle
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
