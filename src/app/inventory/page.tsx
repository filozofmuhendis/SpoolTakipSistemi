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
  const [categoryFilter, setCategoryFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showLowStock, setShowLowStock] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    loadInventory()
  }, [categoryFilter, typeFilter, statusFilter, showLowStock])

  const loadInventory = async () => {
    try {
      setLoading(true)
      setError(null)
      let data: Inventory[]

      if (showLowStock) {
        data = await inventoryService.getLowStockItems()
      } else if (categoryFilter) {
        data = await inventoryService.getInventoryByCategory(categoryFilter)
      } else {
        data = await inventoryService.getAllInventory()
      }

      // Filtreleme
      let filteredData = data
      
      if (typeFilter) {
        filteredData = filteredData.filter(item => item.type === typeFilter)
      }
      
      if (statusFilter) {
        filteredData = filteredData.filter(item => item.status === statusFilter)
      }

      setInventory(filteredData)
    } catch (error: any) {
      console.log('Envanter yükleme hatası:', error)
      setError('Envanter yüklenirken bir hata oluştu')
      showToast({ type: 'error', message: 'Envanter yüklenirken bir hata oluştu' })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadInventory()
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await inventoryService.searchInventory(searchTerm)
      setInventory(data)
    } catch (error: any) {
      console.log('Arama hatası:', error)
      setError('Arama sırasında bir hata oluştu')
      showToast({ type: 'error', message: 'Arama sırasında bir hata oluştu' })
    } finally {
      setLoading(false)
    }
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

  if (loading) return <Loading />
  if (error) return <ErrorState title="Hata" description={error} />

  const categories = Array.from(new Set(inventory.map(item => item.category)))
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.cost), 0)
  const lowStockCount = inventory.filter(item => item.quantity <= item.minStock).length

  // Veri yoksa boş durum göster
  if (inventory.length === 0) {
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
          description={searchTerm || categoryFilter || typeFilter || statusFilter || showLowStock 
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Malzeme</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{inventory.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Düşük Stok</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{lowStockCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Değer</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                ₺{totalValue.toLocaleString()}
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Kategoriler</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{categories.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Malzeme adı, kodu veya kategori ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Tüm Türler</option>
              <option value="raw_material">Hammadde</option>
              <option value="finished_product">Bitmiş Ürün</option>
              <option value="semi_finished">Yarı Mamul</option>
              <option value="consumable">Sarf Malzemesi</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
              <option value="discontinued">Kullanımdan Kaldırıldı</option>
            </select>

            <button
              onClick={() => setShowLowStock(!showLowStock)}
              className={`px-3 py-2 rounded-md flex items-center gap-2 ${
                showLowStock 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Düşük Stok
            </button>
          </div>
        </div>
      </div>

      {/* Envanter Listesi */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Malzeme
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Stok
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Konum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Değer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.code}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(item.type)}`}>
                      {item.type === 'raw_material' && 'Hammadde'}
                      {item.type === 'finished_product' && 'Bitmiş Ürün'}
                      {item.type === 'semi_finished' && 'Yarı Mamul'}
                      {item.type === 'consumable' && 'Sarf Malzemesi'}
                    </span>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {item.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {item.quantity} {item.unit}
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatus(item.quantity, item.minStock)}`}>
                      {item.quantity <= item.minStock ? 'Düşük' : 'Normal'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {item.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      ₺{(item.quantity * item.cost).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      ₺{item.cost.toLocaleString()}/{item.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {item.status === 'active' && 'Aktif'}
                      {item.status === 'inactive' && 'Pasif'}
                      {item.status === 'discontinued' && 'Kullanımdan Kaldırıldı'}
                    </span>
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
