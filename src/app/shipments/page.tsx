'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Truck, Calendar, Package, MapPin, Clock } from 'lucide-react'
import { shipmentService } from '@/lib/services/shipments'
import { projectService } from '@/lib/services/projects'
import { Shipment, Project } from '@/types'
import Link from 'next/link'
import Loading from '@/components/ui/Loading'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import { useToast } from '@/components/ui/ToastProvider'

interface ShipmentWithProject extends Shipment {
  project?: Project;
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<ShipmentWithProject[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { showToast } = useToast()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadShipments()
  }, [])

  const loadShipments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Sevkiyatları ve projeleri paralel olarak çek
      const [shipmentsData, projectsData] = await Promise.all([
        shipmentService.getAllShipments(),
        projectService.getAllProjects()
      ])

      // Her sevkiyat için proje bilgisini ekle
      const shipmentsWithProjects = shipmentsData.map(shipment => {
        const project = projectsData.find(p => p.id === shipment.project_id)
        return {
          ...shipment,
          project
        }
      })

      setShipments(shipmentsWithProjects)
      setProjects(projectsData)
    } catch (error) {
      setError('Sevkiyatlar yüklenirken bir hata oluştu.')
      showToast({ type: 'error', message: 'Sevkiyatlar yüklenirken bir hata oluştu.' })
    } finally {
      setLoading(false)
    }
  }

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.project?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_transit': return 'bg-blue-100 text-blue-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_transit': return 'Yolda'
      case 'delivered': return 'Teslim Edildi'
      case 'pending': return 'Beklemede'
      case 'cancelled': return 'İptal Edildi'
      default: return 'Bilinmiyor'
    }
  }

  if (loading) {
    return <Loading text="Sevkiyatlar yükleniyor..." />
  }

  if (error) {
    return <ErrorState title="Hata" description={error} />
  }

  if (filteredShipments.length === 0) {
    return <EmptyState title="Sevkiyat bulunamadı" description="Kriterlere uygun sevkiyat kaydı yok." />
  }

  return (
    <div className="p-6 w-full max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Sevkiyatlar</h1>
        <Link href="/shipments/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Yeni Sevkiyat
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Proje adı veya notlar ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="pending">Beklemede</option>
              <option value="in_transit">Yolda</option>
              <option value="delivered">Teslim Edildi</option>
              <option value="cancelled">İptal Edildi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shipments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShipments.map((shipment) => (
          <div key={shipment.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Sevkiyat #{shipment.id.slice(-6)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {shipment.project?.name || 'Bilinmiyor'}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(shipment.status || 'unknown')}`}>
                  {getStatusText(shipment.status || 'unknown')}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4 mr-2" />
                {shipment.shipment_date ? new Date(shipment.shipment_date).toLocaleDateString('tr-TR') : 'Tarih belirtilmemiş'}
              </div>
              
              {shipment.notes && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="line-clamp-2">{shipment.notes}</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <Link
                  href={`/shipments/${shipment.id}`}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                >
                  Detayları Görüntüle
                </Link>
                <Link
                  href={`/shipments/${shipment.id}/edit`}
                  className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium"
                >
                  Düzenle
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
