'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, X } from 'lucide-react'
import Link from 'next/link'
import { personnelService, Personnel } from '@/lib/services/personnel'
import Loading from '@/components/ui/Loading'
import ErrorState from '@/components/ui/ErrorState'

interface PersonnelForm {
  fullName: string
  email: string
  phone: string
  department: string
  position: string
}

const departmentOptions = [
  { value: 'İmalat', label: 'İmalat' },
  { value: 'Kalite Kontrol', label: 'Kalite Kontrol' },
  { value: 'Proje Yönetimi', label: 'Proje Yönetimi' },
  { value: 'Satış', label: 'Satış' },
  { value: 'Muhasebe', label: 'Muhasebe' },
  { value: 'İnsan Kaynakları', label: 'İnsan Kaynakları' },
  { value: 'Bilgi Teknolojileri', label: 'Bilgi Teknolojileri' },
  { value: 'Güvenlik', label: 'Güvenlik' },
  { value: 'Temizlik', label: 'Temizlik' },
  { value: 'Diğer', label: 'Diğer' }
]

const positionOptions = [
  { value: 'İmalat Ustası', label: 'İmalat Ustası' },
  { value: 'Kaynakçı', label: 'Kaynakçı' },
  { value: 'Kalite Kontrol Uzmanı', label: 'Kalite Kontrol Uzmanı' },
  { value: 'Proje Müdürü', label: 'Proje Müdürü' },
  { value: 'Satış Temsilcisi', label: 'Satış Temsilcisi' },
  { value: 'Muhasebe Uzmanı', label: 'Muhasebe Uzmanı' },
  { value: 'İK Uzmanı', label: 'İK Uzmanı' },
  { value: 'Sistem Yöneticisi', label: 'Sistem Yöneticisi' },
  { value: 'Güvenlik Görevlisi', label: 'Güvenlik Görevlisi' },
  { value: 'Temizlik Görevlisi', label: 'Temizlik Görevlisi' },
  { value: 'Stajyer', label: 'Stajyer' },
  { value: 'Diğer', label: 'Diğer' }
]

export default function EditPersonnel({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [personnel, setPersonnel] = useState<Personnel | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<PersonnelForm>()

  useEffect(() => {
    loadPersonnel()
  }, [params.id])

  const loadPersonnel = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await personnelService.getPersonnelById(params.id)
      if (data) {
        setPersonnel(data)
        reset({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone || '',
          department: data.department || '',
          position: data.position || ''
        })
      } else {
        setError('Personel bulunamadı')
      }
    } catch (error: any) {
      setError('Personel yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: PersonnelForm) => {
    if (!personnel) return
    
    try {
      setSaving(true)
      setError(null)
      
      const updateData = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || undefined,
        department: data.department,
        position: data.position
      }

      const result = await personnelService.updatePersonnel(personnel.id, updateData)
      
      if (result) {
        router.push(`/personnel/${personnel.id}?success=true`)
      } else {
        setError('Personel güncellenemedi')
      }
    } catch (error: any) {
      console.log('Personel güncelleme hatası:', error)
      setError(error.message || 'Personel güncellenirken bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loading text="Personel yükleniyor..." />
  }

  if (error) {
    return <ErrorState title="Hata" description={error} />
  }

  if (!personnel) {
    return <ErrorState title="Personel bulunamadı" description="Aradığınız personel bulunamadı." />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link 
                href={`/personnel/${personnel.id}`}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Personel Düzenle
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {personnel.fullName} - {personnel.position || 'Pozisyon belirtilmemiş'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Temel Bilgiler */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ad Soyad *
                </label>
                <input
                  {...register('fullName', { required: 'Ad Soyad gereklidir' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Örn: Ahmet Demir"
                />
                {errors.fullName && (
                  <span className="text-red-500 text-sm">{errors.fullName.message}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  E-posta *
                </label>
                <input
                  {...register('email', { 
                    required: 'E-posta gereklidir',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Geçerli bir e-posta adresi giriniz'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  type="email"
                  placeholder="ornek@firma.com"
                />
                {errors.email && (
                  <span className="text-red-500 text-sm">{errors.email.message}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Telefon
                </label>
                <input
                  {...register('phone')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="0555 123 45 67"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Departman *
                </label>
                <select
                  {...register('department', { required: 'Departman seçilmelidir' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Departman seçiniz...</option>
                  {departmentOptions.map(dept => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <span className="text-red-500 text-sm">{errors.department.message}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pozisyon *
                </label>
                <select
                  {...register('position', { required: 'Pozisyon seçilmelidir' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Pozisyon seçiniz...</option>
                  {positionOptions.map(pos => (
                    <option key={pos.value} value={pos.value}>
                      {pos.label}
                    </option>
                  ))}
                </select>
                {errors.position && (
                  <span className="text-red-500 text-sm">{errors.position.message}</span>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href={`/personnel/${personnel.id}`}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>İptal</span>
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Kaydet</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 