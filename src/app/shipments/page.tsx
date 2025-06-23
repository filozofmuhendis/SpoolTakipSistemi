'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Truck, Calendar, Package, MapPin, Clock } from 'lucide-react'
import { shipmentService } from '@/lib/services/shipments'
import { spoolService } from '@/lib/services/spools'
import { Shipment } from '@/types'
import Link from 'next/link'

interface ShipmentWithStats extends Shipment {
  spoolCount: number;
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<ShipmentWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  useEffect(() => {
    loadShipments()
  }, [])

  const loadShipments = async () => {
    try {
      setLoading(true)
      
      // Sevkiyatları ve spool'ları paralel olarak çek
      const [shipmentsData, spoolsData] = await Promise.all([
        shipmentService.getAllShipments(),
        spoolService.getAllSpools()
      ])

      // Her sevkiyat için spool sayısını hesapla
      const shipmentsWithStats = shipmentsData.map(shipment => {
        const shipmentSpools = spoolsData.filter(spool => spool.projectId === shipment.projectId)
        
        return {
          ...shipment,
          spoolCount: shipmentSpools.length
        }
      })

      setShipments(shipmentsWithStats)
    } catch (error) {
      console.error('Sevkiyatlar yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.carrier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || shipment.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusColor = (status: Shipment['status']) => {
    switch (status) {
      case 'in_transit': return 'bg-blue-100 text-blue-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Shipment['status']) => {
    switch (status) {
      case 'in_transit': return 'Yolda'
      case 'delivered': return 'Teslim Edildi'
      case 'pending': return 'Beklemede'
      case 'cancelled': return 'İptal Edildi'
      default: return 'Bilinmiyor'
    }
  }

  const getPriorityColor = (priority: Shipment['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityText = (priority: Shipment['priority']) => {
    switch (priority) {
      case 'urgent': return 'Acil'
      case 'high': return 'Yüksek'
      case 'medium': return 'Orta'
      case 'low': return 'Düşük'
      default: return 'Bilinmiyor'
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Sevkiyatlar yükleniyor...</p>
        </div>
      </div>
    )
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
                placeholder="Sevkiyat no, proje adı, hedef veya kargo firması ara..."
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
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Tüm Öncelikler</option>
              <option value="urgent">Acil</option>
              <option value="high">Yüksek</option>
              <option value="medium">Orta</option>
              <option value="low">Düşük</option>
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{shipment.number}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{shipment.projectName || 'Bilinmiyor'}</p>
              </div>
              <div className="flex flex-col gap-1">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(shipment.status)}`}>
                  {getStatusText(shipment.status)}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(shipment.priority)}`}>
                  {getPriorityText(shipment.priority)}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4 mr-2" />
                {shipment.destination}
              </div>
              
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Truck className="h-4 w-4 mr-2" />
                {shipment.carrier}
              </div>
              
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4 mr-2" />
                Planlanan: {new Date(shipment.scheduledDate).toLocaleDateString('tr-TR')}
                {shipment.actualDate && (
                  <span className="ml-2">
                    | Teslim: {new Date(shipment.actualDate).toLocaleDateString('tr-TR')}
                  </span>
                )}
              </div>
              
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Package className="h-4 w-4 mr-2" />
                {shipment.spoolCount} Spool | {shipment.totalWeight} kg
              </div>
              
              {shipment.trackingNumber && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4 mr-2" />
                  Takip No: {shipment.trackingNumber}
                </div>
              )}
            </div>
            
            <div className="mt-6 flex gap-2">
              <Link href={`/shipments/${shipment.id}`} className="flex-1 btn-secondary text-sm text-center">
                Detaylar
              </Link>
              <Link href={`/shipments/${shipment.id}/edit`} className="flex-1 btn-primary text-sm text-center">
                Düzenle
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredShipments.length === 0 && !loading && (
        <div className="text-center py-12">
          <Truck className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Sevkiyat bulunamadı</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Arama kriterlerinize uygun sevkiyat bulunamadı.'
              : 'Henüz sevkiyat oluşturulmamış.'
            }
          </p>
        </div>
      )}
    </div>
  )
}