'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { shipmentService } from '@/lib/services/shipments'
import { Shipment } from '@/types'
import Loading from '@/components/ui/Loading'
import ErrorState from '@/components/ui/ErrorState'
import Link from 'next/link'
import { ArrowLeft, Edit, Truck, Calendar, Package, MapPin, Clock } from 'lucide-react'

export default function ShipmentDetailPage({ params }: { params: { id: string } }) {
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadShipment()
    // eslint-disable-next-line
  }, [params.id])

  const loadShipment = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await shipmentService.getShipmentById(params.id)
      if (!data) {
        setError('Sevkiyat bulunamadı.')
      } else {
        setShipment(data)
      }
    } catch (err) {
      setError('Sevkiyat yüklenirken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading text="Sevkiyat yükleniyor..." />
  if (error || !shipment) return <ErrorState title="Hata" description={error || 'Sevkiyat bulunamadı.'} />

  return (
    <div className="p-6 w-full max-w-[900px] mx-auto">
      <div className="flex items-center mb-6 gap-4">
        <Link href="/shipments" className="btn-secondary flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          Geri
        </Link>
        <h1 className="text-2xl font-bold">Sevkiyat Detayı</h1>
        <Link href={`/shipments/${shipment.id}/edit`} className="ml-auto btn-primary flex items-center gap-2">
          <Edit className="w-4 h-4" />
          Düzenle
        </Link>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Truck className="w-5 h-5" />
              {shipment.number}
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              {shipment.destination}
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Package className="w-4 h-4" />
              {shipment.projectName || 'Bilinmiyor'}
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              Planlanan: {new Date(shipment.scheduledDate).toLocaleDateString('tr-TR')}
              {shipment.actualDate && (
                <span className="ml-2">| Teslim: {new Date(shipment.actualDate).toLocaleDateString('tr-TR')}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              Takip No: {shipment.trackingNumber || '-'}
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Truck className="w-4 h-4" />
              Taşıyıcı: {shipment.carrier}
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Package className="w-4 h-4" />
              Toplam Ağırlık: {shipment.totalWeight} kg
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Durum:</span>
              <span>{shipment.status}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Öncelik:</span>
              <span>{shipment.priority}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 