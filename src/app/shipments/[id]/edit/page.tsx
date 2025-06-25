'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { shipmentService } from '@/lib/services/shipments'
import { projectService } from '@/lib/services/projects'
import { useToast } from '@/components/ui/ToastProvider'
import Loading from '@/components/ui/Loading'
import ErrorState from '@/components/ui/ErrorState'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

export default function EditShipmentPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<any[]>([])
  const { showToast } = useToast()
  const router = useRouter()

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<any>()

  useEffect(() => {
    loadData()
    // eslint-disable-next-line
  }, [params.id])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [shipment, projectsData] = await Promise.all([
        shipmentService.getShipmentById(params.id),
        projectService.getAllProjects()
      ])
      if (!shipment) {
        setError('Sevkiyat bulunamadı.')
        return
      }
      setProjects(projectsData)
      setValue('number', shipment.number)
      setValue('projectId', shipment.projectId)
      setValue('status', shipment.status)
      setValue('priority', shipment.priority)
      setValue('destination', shipment.destination)
      setValue('scheduledDate', shipment.scheduledDate?.split('T')[0] || '')
      setValue('actualDate', shipment.actualDate?.split('T')[0] || '')
      setValue('carrier', shipment.carrier)
      setValue('trackingNumber', shipment.trackingNumber)
      setValue('totalWeight', shipment.totalWeight)
    } catch (err) {
      setError('Sevkiyat yüklenirken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: any) => {
    try {
      setLoading(true)
      setError(null)
      await shipmentService.updateShipment(params.id, {
        number: data.number,
        projectId: data.projectId,
        status: data.status,
        priority: data.priority,
        destination: data.destination,
        scheduledDate: data.scheduledDate,
        actualDate: data.actualDate,
        carrier: data.carrier,
        trackingNumber: data.trackingNumber,
        totalWeight: Number(data.totalWeight)
      })
      showToast({ type: 'success', message: 'Sevkiyat güncellendi!' })
      router.push(`/shipments/${params.id}`)
    } catch (err: any) {
      setError(err.message || 'Sevkiyat güncellenirken bir hata oluştu.')
      showToast({ type: 'error', message: 'Sevkiyat güncellenirken bir hata oluştu.' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading text="Sevkiyat yükleniyor..." />
  if (error) return <ErrorState title="Hata" description={error} />

  return (
    <div className="p-6 w-full max-w-[900px] mx-auto">
      <div className="flex items-center mb-6 gap-4">
        <Link href={`/shipments/${params.id}`} className="btn-secondary flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          Geri
        </Link>
        <h1 className="text-2xl font-bold">Sevkiyat Düzenle</h1>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2">Sevkiyat Numarası</label>
              <input {...register('number', { required: 'Numara gereklidir' })} className="w-full p-2 border rounded" />
              {errors.number && <span className="text-red-500 text-sm">{errors.number.message}</span>}
            </div>
            <div>
              <label className="block mb-2">Proje *</label>
              <select {...register('projectId', { required: 'Proje seçilmelidir' })} className="w-full p-2 border rounded">
                <option value="">Proje seçin</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
              {errors.projectId && <span className="text-red-500 text-sm">{errors.projectId.message}</span>}
            </div>
            <div>
              <label className="block mb-2">Durum</label>
              <select {...register('status', { required: 'Durum gereklidir' })} className="w-full p-2 border rounded">
                <option value="pending">Beklemede</option>
                <option value="in_transit">Yolda</option>
                <option value="delivered">Teslim Edildi</option>
                <option value="cancelled">İptal Edildi</option>
              </select>
            </div>
            <div>
              <label className="block mb-2">Öncelik</label>
              <select {...register('priority', { required: 'Öncelik gereklidir' })} className="w-full p-2 border rounded">
                <option value="urgent">Acil</option>
                <option value="high">Yüksek</option>
                <option value="medium">Orta</option>
                <option value="low">Düşük</option>
              </select>
            </div>
            <div>
              <label className="block mb-2">Hedef / Varış Noktası</label>
              <input {...register('destination', { required: 'Hedef gereklidir' })} className="w-full p-2 border rounded" />
              {errors.destination && <span className="text-red-500 text-sm">{errors.destination.message}</span>}
            </div>
            <div>
              <label className="block mb-2">Planlanan Tarih</label>
              <input type="date" {...register('scheduledDate', { required: 'Planlanan tarih gereklidir' })} className="w-full p-2 border rounded" />
              {errors.scheduledDate && <span className="text-red-500 text-sm">{errors.scheduledDate.message}</span>}
            </div>
            <div>
              <label className="block mb-2">Teslim Tarihi</label>
              <input type="date" {...register('actualDate')} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block mb-2">Taşıyıcı</label>
              <input {...register('carrier', { required: 'Taşıyıcı gereklidir' })} className="w-full p-2 border rounded" />
              {errors.carrier && <span className="text-red-500 text-sm">{errors.carrier.message}</span>}
            </div>
            <div>
              <label className="block mb-2">Takip Numarası</label>
              <input {...register('trackingNumber')} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block mb-2">Toplam Ağırlık (kg)</label>
              <input type="number" {...register('totalWeight', { valueAsNumber: true })} className="w-full p-2 border rounded" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </form>
      </div>
    </div>
  )
} 