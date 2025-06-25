'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Package, Calendar, User } from 'lucide-react'
import { projectService } from '@/lib/services/projects'
import { spoolService } from '@/lib/services/spools'
import { Project } from '@/types'
import Link from 'next/link'
import Loading from '@/components/ui/Loading'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import { useToast } from '@/components/ui/ToastProvider'

interface ProjectWithStats extends Project {
  spoolCount: number;
  completedSpools: number;
  progress: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { showToast } = useToast()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Projeleri ve spool'ları paralel olarak çek
      const [projectsData, spoolsData] = await Promise.all([
        projectService.getAllProjects(),
        spoolService.getAllSpools()
      ])

      // Her proje için spool istatistiklerini hesapla
      const projectsWithStats = projectsData.map(project => {
        const projectSpools = spoolsData.filter(spool => spool.projectId === project.id)
        const completedSpools = projectSpools.filter(spool => spool.status === 'completed').length
        const progress = projectSpools.length > 0 ? Math.round((completedSpools / projectSpools.length) * 100) : 0

        return {
          ...project,
          spoolCount: projectSpools.length,
          completedSpools,
          progress
        }
      })

      setProjects(projectsWithStats)
    } catch (error) {
      setError('Projeler yüklenirken bir hata oluştu.')
      showToast({ type: 'error', message: 'Projeler yüklenirken bir hata oluştu.' })
      console.log('Projeler yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.managerName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'Aktif'
      case 'completed': return 'Tamamlandı'
      case 'pending': return 'Beklemede'
      default: return 'Bilinmiyor'
    }
  }

  if (loading) {
    return <Loading text="Projeler yükleniyor..." />
  }

  if (error) {
    return <ErrorState title="Hata" description={error} />
  }

  if (filteredProjects.length === 0) {
    return <EmptyState title="Proje bulunamadı" description={searchTerm || statusFilter !== 'all' ? 'Arama kriterlerinize uygun proje bulunamadı.' : 'Henüz proje oluşturulmamış.'} />
  }

  return (
    <div className="p-6 w-full max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Projeler</h1>
        <Link href="/projects/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Yeni Proje
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
                placeholder="Proje adı veya yönetici ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="completed">Tamamlandı</option>
              <option value="pending">Beklemede</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{project.name}</h3>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                {getStatusText(project.status)}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <User className="h-4 w-4 mr-2" />
                {project.managerName || 'Atanmamış'}
              </div>
              
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(project.startDate).toLocaleDateString('tr-TR')}
                {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString('tr-TR')}`}
              </div>
              
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Package className="h-4 w-4 mr-2" />
                {project.completedSpools}/{project.spoolCount} Spool
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">İlerleme</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                    style={{width: `${project.progress}%`}}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-2">
              <Link href={`/projects/${project.id}`} className="flex-1 btn-secondary text-sm text-center">
                Detaylar
              </Link>
              <Link href={`/projects/${project.id}/edit`} className="flex-1 btn-primary text-sm text-center">
                Düzenle
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
