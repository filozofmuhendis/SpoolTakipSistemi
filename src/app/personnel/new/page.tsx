'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { personnelService } from '@/lib/services/personnel'
import { supabase } from '@/lib/supabase'

interface PersonnelForm {
  fullName: string
  role: string
  isActive: boolean
  email: string
  password: string
  hire_date?: string
  permissions: {
    projects: boolean
    manufacturing: boolean
    quality: boolean
    reports: boolean
    admin: boolean
    inventory: boolean
  }
}

const roleOptions = [
  { value: 'manufacturer', label: 'İmalatçı' },
  { value: 'argon_welder', label: 'Argon Kaynakçı' },
  { value: 'gas_welder', label: 'Gazaltı Kaynakçı' },
  { value: 'quality', label: 'Kontrol Personeli' },
  { value: 'project_manager', label: 'Proje Takipçi' },
  { value: 'admin', label: 'Yönetici' }
]

export default function NewPersonnel() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<PersonnelForm>({
    defaultValues: {
      isActive: true,
      hire_date: '',
      permissions: {
        projects: false,
        manufacturing: false,
        quality: false,
        reports: false,
        admin: false,
        inventory: false
      }
    }
  })

  const onSubmit = async (data: PersonnelForm) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Önce Supabase Auth ile kullanıcı oluştur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: data.role
          }
        }
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (authData.user) {
        // Profil tablosuna personel bilgilerini ekle
        const personnelData = {
          name: data.fullName,
          email: data.email,
          phone: '', // Form'da telefon alanı yok, boş bırakıyoruz
          position: data.role,
          department: 'Üretim', // Varsayılan departman
          status: (data.isActive ? 'active' : 'inactive') as 'active' | 'inactive' | 'on_leave',
          hireDate: data.hire_date && data.hire_date !== '' ? data.hire_date : new Date().toISOString().split('T')[0]
        }

        try {
          await personnelService.createPersonnel(personnelData)
          router.push('/personnel?success=true')
        } catch (profileError: any) {
          // Eğer profil oluşturulamazsa, auth kullanıcısını da sil
          await supabase.auth.admin.deleteUser(authData.user.id)
          throw new Error(profileError.message)
        }
      }
    } catch (error: any) {
      console.log('Personel ekleme hatası:', error)
      setError(error.message || 'Personel eklenirken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedRole = watch('role')

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6">Yeni Personel Kaydı</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Temel Bilgiler */}
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Ad Soyad</label>
              <input
                {...register('fullName', { required: 'Ad Soyad gereklidir' })}
                className="w-full p-2 border rounded"
                placeholder="Örn: Ahmet Demir"
              />
              {errors.fullName && (
                <span className="text-red-500 text-sm">{errors.fullName.message}</span>
              )}
            </div>

            <div>
              <label className="block mb-2">Görev Türü</label>
              <select
                {...register('role', { required: 'Görev türü seçilmelidir' })}
                className="w-full p-2 border rounded"
              >
                <option value="">Seçiniz...</option>
                {roleOptions.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              {errors.role && (
                <span className="text-red-500 text-sm">{errors.role.message}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('isActive')}
                className="w-4 h-4"
              />
              <label>Aktif Personel</label>
            </div>

            {/* İşe Başlama Tarihi Alanı */}
            <div>
              <label className="block mb-2">İşe Başlama Tarihi</label>
              <input
                type="date"
                {...register('hire_date')}
                className="w-full p-2 border rounded"
              />
              {errors.hire_date && (
                <span className="text-red-500 text-sm">{errors.hire_date.message}</span>
              )}
            </div>
          </div>

          {/* Kullanıcı Girişi */}
          <div className="space-y-4 pt-4 border-t">
            <h2 className="text-xl font-semibold">Kullanıcı Girişi Bilgileri</h2>
            
            <div>
              <label className="block mb-2">E-posta / Kullanıcı Adı</label>
              <input
                {...register('email', { 
                  required: 'E-posta gereklidir',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Geçerli bir e-posta adresi giriniz'
                  }
                })}
                className="w-full p-2 border rounded"
                type="email"
              />
              {errors.email && (
                <span className="text-red-500 text-sm">{errors.email.message}</span>
              )}
            </div>

            <div>
              <label className="block mb-2">Şifre</label>
              <input
                {...register('password', { 
                  required: 'Şifre gereklidir',
                  minLength: {
                    value: 6,
                    message: 'Şifre en az 6 karakter olmalıdır'
                  }
                })}
                type="password"
                className="w-full p-2 border rounded"
              />
              {errors.password && (
                <span className="text-red-500 text-sm">{errors.password.message}</span>
              )}
            </div>
          </div>

          {/* Yetkiler */}
          <div className="space-y-4 pt-4 border-t">
            <h2 className="text-xl font-semibold">Erişim Yetkileri</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('permissions.projects')}
                  className="w-4 h-4"
                />
                <label>Projeler</label>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('permissions.manufacturing')}
                  className="w-4 h-4"
                />
                <label>İmalat</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('permissions.quality')}
                  className="w-4 h-4"
                />
                <label>Kalite Kontrol</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('permissions.reports')}
                  className="w-4 h-4"
                />
                <label>Raporlar</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('permissions.inventory')}
                  className="w-4 h-4"
                />
                <label>Stok/Envanter</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('permissions.admin')}
                  className="w-4 h-4"
                />
                <label>Yönetici Paneli</label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isLoading ? 'Kaydediliyor...' : 'Personel Kaydını Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
