'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, User, Mail, Phone, Calendar, Briefcase } from 'lucide-react'
import { personnelService } from '@/lib/services/personnel'
import { projectService } from '@/lib/services/projects'
import { workOrderService } from '@/lib/services/workOrders'
import { Personnel } from '@/types'
import { WorkOrder } from '@/types'
import Link from 'next/link'

interface PersonnelWithStats extends Personnel {
  projects: number;
  completedTasks: number;
}

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<PersonnelWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadPersonnel()
  }, [])

  const loadPersonnel = async () => {
    try {
      setLoading(true)
      
      // Paralel olarak tüm verileri çek
      const [personnelData, projects, workOrders] = await Promise.all([
        personnelService.getAllPersonnel(),
        projectService.getAllProjects(),
        workOrderService.getAllWorkOrders()
      ])
      
      // Her personel için gerçek istatistikleri hesapla
      const personnelWithStats = personnelData.map((person: Personnel) => {
        // Personelin atandığı iş emirlerini bul
        const personWorkOrders = workOrders.filter((wo: WorkOrder) => wo.assignedTo === person.id)
        const completedWorkOrders = personWorkOrders.filter((wo: WorkOrder) => wo.status === 'completed')
        
        // Personelin çalıştığı projeleri bul (iş emirlerinden)
        const personProjects = new Set(personWorkOrders.map((wo: WorkOrder) => wo.projectId))
        
        return {
          ...person,
          projects: personProjects.size,
          completedTasks: completedWorkOrders.length
        }
      })

      setPersonnel(personnelWithStats)
    } catch (error) {
      console.error('Personel yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPersonnel = personnel.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = departmentFilter === 'all' || person.department === departmentFilter
    const matchesStatus = statusFilter === 'all' || person.status === statusFilter
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const getStatusColor = (status: Personnel['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'on_leave': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Personnel['status']) => {
    switch (status) {
      case 'active': return 'Aktif'
      case 'inactive': return 'Pasif'
      case 'on_leave': return 'İzinde'
      default: return 'Bilinmiyor'
    }
  }

  const departments = Array.from(new Set(personnel.map(p => p.department)))

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Personel yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 w-full max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Personel</h1>
        <Link href="/personnel/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Yeni Personel
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Ad, email veya pozisyon ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Tüm Departmanlar</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
              <option value="on_leave">İzinde</option>
            </select>
          </div>
        </div>
      </div>

      {/* Personnel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPersonnel.map((person) => (
          <div key={person.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{person.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{person.position}</p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(person.status)}`}>
                {getStatusText(person.status)}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4 mr-2" />
                {person.email}
              </div>
              
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4 mr-2" />
                {person.phone}
              </div>
              
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Briefcase className="h-4 w-4 mr-2" />
                {person.department}
              </div>
              
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4 mr-2" />
                İşe Başlama: {new Date(person.hireDate).toLocaleDateString('tr-TR')}
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-lg font-semibold text-primary-600">{person.projects}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Proje</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">{person.completedTasks}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Tamamlanan Görev</div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-2">
              <Link href={`/personnel/${person.id}`} className="flex-1 btn-secondary text-sm text-center">
                Detaylar
              </Link>
              <Link href={`/personnel/${person.id}/edit`} className="flex-1 btn-primary text-sm text-center">
                Düzenle
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredPersonnel.length === 0 && !loading && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Personel bulunamadı</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || departmentFilter !== 'all' || statusFilter !== 'all'
              ? 'Arama kriterlerinize uygun personel bulunamadı.'
              : 'Henüz personel kaydı oluşturulmamış.'
            }
          </p>
        </div>
      )}
    </div>
  )
}