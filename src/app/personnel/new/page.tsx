'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

interface PersonnelForm {
  fullName: string
  role: string
  isActive: boolean
  email: string
  password: string
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
  const { register, handleSubmit, watch, formState: { errors } } = useForm<PersonnelForm>({
    defaultValues: {
      isActive: true,
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

  const onSubmit = (data: PersonnelForm) => {
    console.log(data)
    // API call will be implemented here
  }

  const selectedRole = watch('role')

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6">Yeni Personel Kaydı</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Personel Kaydını Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}