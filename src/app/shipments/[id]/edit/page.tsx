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

interface ShipmentFormData {
  project_id: string
  status: string
  shipment_date: string
  notes: string
}

export default function EditShipmentPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<any[]>([])
  const { showToast } = useToast()
  const router = useRouter()

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ShipmentFormData>()

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
      setValue('project_id', shipment.project_id || '')
      setValue('status', shipment.status || 'pending')
      setValue('shipment_date', shipment.shipment_date?.split('T')[0] || '')
      setValue('notes', shipment.notes || '')
    } catch (err) {
      setError('Sevkiyat yüklenirken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ShipmentFormData) => {
    try {
      setLoading(true)
      setError(null)
      await shipmentService.updateShipment(params.id, {
        project_id: data.project_id,
        status: data.status,
        shipment_date: data.shipment_date,
        notes: data.notes
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
              <label className="block mb-2">Proje *</label>
              <select {...register('project_id', { required: 'Proje seçilmelidir' })} className="w-full p-2 border rounded">
                <option value="">Proje seçin</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
              {errors.project_id && <span className="text-red-500 text-sm">{errors.project_id.message}</span>}
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
              <label className="block mb-2">Sevkiyat Tarihi</label>
              <input type="date" {...register('shipment_date', { required: 'Sevkiyat tarihi gereklidir' })} className="w-full p-2 border rounded" />
              {errors.shipment_date && <span className="text-red-500 text-sm">{errors.shipment_date.message}</span>}
            </div>
          </div>
          <div>
            <label className="block mb-2">Notlar</label>
            <textarea {...register('notes')} className="w-full p-2 border rounded" rows={4} placeholder="Sevkiyat hakkında notlar..." />
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