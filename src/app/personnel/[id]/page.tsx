'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, UserCircle, Building, Mail, Phone, Calendar, Briefcase, Edit, Trash, Activity } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Loading from '@/components/ui/Loading'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import { personnelService, Personnel } from '@/lib/services/personnel'
import DeletePersonnelModal from '../components/DeletePersonnelModal'

export default function PersonnelDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [personnel, setPersonnel] = useState<Personnel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState(false)

  useEffect(() => {
    const fetchPersonnel = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await personnelService.getPersonnelById(params.id)
        setPersonnel(data)
      } catch (err: any) {
        setError('Personel bulunamadı veya yüklenirken hata oluştu')
      } finally {
        setLoading(false)
      }
    }
    fetchPersonnel()
  }, [params.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR')
  }

  const handleDelete = async () => {
    if (!personnel) return
    
    try {
      const success = await personnelService.deletePersonnel(personnel.id)
      if (success) {
        router.push('/personnel?deleted=true')
      } else {
        setError('Personel silinirken bir hata oluştu')
      }
    } catch (error) {
      setError('Personel silinirken bir hata oluştu')
    }
  }

  if (loading) {
    return <Loading text="Personel yükleniyor..." />
  }
  if (error) {
    return <ErrorState title="Bir hata oluştu" description={error} />
  }
  if (!personnel) {
    return <EmptyState title="Personel bulunamadı." />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/personnel" 
              className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {personnel.fullName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{personnel.position || 'Pozisyon belirtilmemiş'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/personnel/${personnel.id}/edit`}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Düzenle
            </Link>
            <button 
              onClick={() => setDeleteModal(true)}
              className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Trash className="w-4 h-4" />
              Sil
            </button>
          </div>
        </div>

        {/* Personnel Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-start gap-6">
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full">
              <UserCircle className="w-24 h-24 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Departman</p>
                <div className="flex items-center gap-2 mt-1">
                  <Building className="w-4 h-4 text-gray-400" />
                  <p className="font-medium text-gray-900 dark:text-white">
                    {personnel.department || 'Belirtilmemiş'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="font-medium text-gray-900 dark:text-white">{personnel.email}</p>
                </div>
              </div>
              {personnel.phone && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Telefon</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <p className="font-medium text-gray-900 dark:text-white">{personnel.phone}</p>
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pozisyon</p>
                <div className="flex items-center gap-2 mt-1">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <p className="font-medium text-gray-900 dark:text-white">
                    {personnel.position || 'Belirtilmemiş'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Kayıt Tarihi</p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(personnel.createdAt)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Durum</p>
                <div className="flex items-center gap-2 mt-1">
                  <Activity className="w-4 h-4 text-green-500" />
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Aktif
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Work History */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              İş Bilgileri
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{personnel.position || 'Pozisyon belirtilmemiş'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{personnel.department || 'Departman belirtilmemiş'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(personnel.createdAt)} - Günümüz
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.floor((new Date().getTime() - new Date(personnel.createdAt).getTime()) / (1000 * 60 * 60 * 24))} gün
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              İletişim Bilgileri
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">E-posta</p>
                <p className="font-medium text-gray-900 dark:text-white">{personnel.email}</p>
              </div>
              {personnel.phone && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Telefon</p>
                  <p className="font-medium text-gray-900 dark:text-white">{personnel.phone}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Departman</p>
                <p className="font-medium text-gray-900 dark:text-white">{personnel.department || 'Belirtilmemiş'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Hızlı İşlemler
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href={`/personnel/${personnel.id}/edit`}
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Edit className="w-6 h-6 text-blue-600 mb-2" />
              <p className="font-medium text-gray-900 dark:text-white">Düzenle</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Personel bilgilerini güncelle</p>
            </Link>
            <button className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
              <Activity className="w-6 h-6 text-green-600 mb-2" />
              <p className="font-medium text-gray-900 dark:text-white">Şifre Değiştir</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Kullanıcı şifresini güncelle</p>
            </button>
            <button 
              onClick={() => setDeleteModal(true)}
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <Trash className="w-6 h-6 text-red-600 mb-2" />
              <p className="font-medium text-gray-900 dark:text-white">Sil</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Personeli sistemden kaldır</p>
            </button>
          </div>
        </div>

        {/* Delete Modal */}
        {deleteModal && (
          <DeletePersonnelModal
            onClose={() => setDeleteModal(false)}
            onConfirm={handleDelete}
            mode="delete"
          />
        )}
      </div>
    </div>
  )
}