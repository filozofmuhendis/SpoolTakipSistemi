'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { personnelService, Personnel } from '@/lib/services/personnel'
import { Eye, EyeOff } from 'lucide-react'

interface PersonnelForm {
  fullName: string
  email: string
  password: string
  confirmPassword: string
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

export default function NewPersonnel() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<PersonnelForm>()

  const password = watch('password')

  const onSubmit = async (data: PersonnelForm) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const personnelData = {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone || undefined,
        department: data.department,
        position: data.position
      }

      const result = await personnelService.createPersonnel(personnelData)
      
      if (result) {
        router.push('/personnel?success=true')
      } else {
        setError('Personel oluşturulamadı')
      }
    } catch (error: any) {
      console.log('Personel ekleme hatası:', error)
      setError(error.message || 'Personel eklenirken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Yeni Personel Ekle
          </h1>

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
                  Şifre *
                </label>
                <div className="relative">
                  <input
                    {...register('password', { 
                      required: 'Şifre gereklidir',
                      minLength: {
                        value: 6,
                        message: 'Şifre en az 6 karakter olmalıdır'
                      }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="En az 6 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-red-500 text-sm">{errors.password.message}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Şifre Tekrar *
                </label>
                <div className="relative">
                  <input
                    {...register('confirmPassword', { 
                      required: 'Şifre tekrarı gereklidir',
                      validate: value => value === password || 'Şifreler eşleşmiyor'
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Şifrenizi tekrar girin"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="text-red-500 text-sm">{errors.confirmPassword.message}</span>
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
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <span>Personel Ekle</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
