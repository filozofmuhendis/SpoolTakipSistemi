'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { shipmentService } from '@/lib/services/shipments'
import { projectService } from '@/lib/services/projects'
import { Shipment, Project } from '@/types'
import Loading from '@/components/ui/Loading'
import ErrorState from '@/components/ui/ErrorState'
import Link from 'next/link'
import { ArrowLeft, Edit, Truck, Calendar } from 'lucide-react'

export default function ShipmentDetailPage({ params }: { params: { id: string } }) {
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [project, setProject] = useState<Project | null>(null)
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
        
        if (data.project_id) {
          const projectData = await projectService.getProjectById(data.project_id)
          setProject(projectData)
        }
      }
    } catch (err) {
      setError('Sevkiyat yüklenirken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_transit': return 'Yolda'
      case 'delivered': return 'Teslim Edildi'
      case 'pending': return 'Beklemede'
      case 'cancelled': return 'İptal Edildi'
      default: return status
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
              Sevkiyat #{shipment.id.slice(-6)}
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Proje:</span>
              <span>{project?.name || 'Bilinmiyor'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span className="font-semibold">Sevkiyat Tarihi:</span>
              <span>
                {shipment.shipment_date ? new Date(shipment.shipment_date).toLocaleDateString('tr-TR') : 'Tarih belirtilmemiş'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Durum:</span>
              <span>{getStatusText(shipment.status || 'unknown')}</span>
            </div>
            {shipment.notes && (
              <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                <span className="font-semibold mt-1">Notlar:</span>
                <span className="whitespace-pre-wrap">{shipment.notes}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 