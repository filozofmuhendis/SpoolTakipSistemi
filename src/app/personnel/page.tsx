'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, Eye, Edit, Trash2, User, Mail, Phone, Building, Calendar } from 'lucide-react'
import { personnelService, Personnel } from '@/lib/services/personnel'
import Loading from '@/components/ui/Loading'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import DeletePersonnelModal from './components/DeletePersonnelModal'

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [filteredPersonnel, setFilteredPersonnel] = useState<Personnel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; personnelId: string; personnelName: string } | null>(null)

  useEffect(() => {
    loadPersonnel()
  }, [])

  useEffect(() => {
    filterPersonnel()
  }, [personnel, searchTerm, departmentFilter])

  const loadPersonnel = async () => {
    try {
      setLoading(true)
      setError(null)
      const personnelData = await personnelService.getAllPersonnel()
      setPersonnel(personnelData)
    } catch (error) {
      setError('Personel yüklenirken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const filterPersonnel = () => {
    let filtered = personnel

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(person =>
        person.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (person.department && person.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (person.position && person.position.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Departman filtresi
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(person => person.department === departmentFilter)
    }

    setFilteredPersonnel(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR')
  }

  const getDepartments = () => {
    const departments = Array.from(new Set(personnel.map(p => p.department).filter(Boolean)))
    return departments.sort()
  }

  const handleDelete = async (personnelId: string) => {
    try {
      const success = await personnelService.deletePersonnel(personnelId)
      if (success) {
        setPersonnel(personnel.filter(p => p.id !== personnelId))
        setDeleteModal(null)
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
    return <ErrorState title="Hata" description={error} />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Personel Yönetimi
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Personel listesini görüntüleyin ve yönetin
            </p>
          </div>
          <Link
            href="/personnel/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Personel</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Personel ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tüm Departmanlar</option>
              {getDepartments().map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-end text-sm text-gray-600 dark:text-gray-400">
              {filteredPersonnel.length} personel bulundu
            </div>
          </div>
        </div>

        {/* Personnel List */}
        {personnel.length === 0 ? (
          <EmptyState 
            title="Personel bulunamadı" 
            description="Henüz kayıtlı personel yok. Yeni personel eklemek için yukarıdaki butonu kullanın."
            icon={<User className="w-12 h-12" />}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Personel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Departman
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Pozisyon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Kayıt Tarihi
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPersonnel.map((person) => (
                    <tr key={person.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {person.fullName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {person.email}
                            </div>
                            {person.phone && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {person.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {person.department || 'Belirtilmemiş'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {person.position || 'Belirtilmemiş'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatDate(person.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/personnel/${person.id}`}
                            className="text-blue-600 hover:text-blue-500 p-1"
                            title="Görüntüle"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/personnel/${person.id}/edit`}
                            className="text-green-600 hover:text-green-500 p-1"
                            title="Düzenle"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteModal({ 
                              show: true, 
                              personnelId: person.id, 
                              personnelName: person.fullName 
                            })}
                            className="text-red-600 hover:text-red-500 p-1"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats */}
        {personnel.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {personnel.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Personel</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-blue-600">
                {getDepartments().length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Departman</div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteModal && (
          <DeletePersonnelModal
            onClose={() => setDeleteModal(null)}
            onConfirm={() => handleDelete(deleteModal.personnelId)}
            mode="delete"
          />
        )}
      </div>
    </div>
  )
}