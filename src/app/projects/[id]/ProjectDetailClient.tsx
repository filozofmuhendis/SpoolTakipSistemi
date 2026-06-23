'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Users, FileText, Activity, Trash, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { projectService } from '@/lib/services/projects'
import { spoolService } from '@/lib/services/spools'
import { personnelService } from '@/lib/services/personnel'
import { Project, UrunAltKalemi, Personnel } from '@/types'
import Loading from '@/components/ui/Loading'
import ErrorState from '@/components/ui/ErrorState'

export default function ProjectDetailClient({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'spools' | 'team'>('overview')
  const [project, setProject] = useState<Project | null>(null)
  const [spools, setSpools] = useState<UrunAltKalemi[]>([])
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [projData, allSpools, allPersonnel] = await Promise.all([
        projectService.getProjectById(params.id),
        spoolService.getAllSpools(),
        personnelService.getAllPersonnel()
      ])

      if (!projData || !projData.id) {
        setError('Proje bulunamadı')
        return
      }

      setProject(projData)
      setSpools(allSpools.filter(s => s.project_id === params.id))
      setPersonnel(allPersonnel)
    } catch (err) {
      console.error('Proje detayları yüklenirken hata:', err)
      setError('Proje detayları yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDelete = async () => {
    if (!project) return
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Bu projeyi silmek istediğinizden emin misiniz?')) {
      try {
        await projectService.deleteProject(project.id)
        router.push('/projects')
      } catch (err) {
        alert('Proje silinirken hata oluştu')
      }
    }
  }

  if (loading) return <Loading text="Proje detayları yükleniyor..." />
  if (error || !project) return <ErrorState title="Hata" description={error || 'Proje bulunamadı'} />

  // Calculate Stats
  const totalSpools = spools.length
  const completedSpools = spools.filter(s => s.status === 'completed').length
  const activeSpools = spools.filter(s => s.status === 'active').length
  const progressPercent = totalSpools > 0 ? Math.round((completedSpools / totalSpools) * 100) : 0

  const manager = personnel.find(p => p.id === project.manager_id)

  const filteredSpools = spools.filter(spool => 
    (spool.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (spool.material || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/projects" className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{project.name}</h1>
              <p className="text-gray-500 dark:text-gray-400">PRJ-{project.id.slice(0, 6).toUpperCase()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleDelete}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
              title="Projeyi Sil"
            >
              <Trash className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <FileText className="w-8 h-8 text-green-500 mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Toplam Spool</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSpools}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <Activity className="w-8 h-8 text-yellow-500 mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Aktif Spool (Üretimde)</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeSpools}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <Users className="w-8 h-8 text-blue-500 mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Proje Yöneticisi</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white truncate">
              {manager ? manager.full_name : 'Atanmamış'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-8">
          <div className="border-b dark:border-gray-700">
            <nav className="flex">
              {(['overview', 'spools', 'team'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400 font-semibold'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  {tab === 'overview' ? 'Genel Bakış' : tab === 'spools' ? 'Spoollar' : 'Ekip'}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Proje Detayları</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Müşteri / Detay</p>
                      <p className="font-medium text-gray-900 dark:text-white">Şantiye Sahası / Genel Proje</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Başlangıç Tarihi</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {project.start_date ? new Date(project.start_date).toLocaleDateString('tr-TR') : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Bitiş Tarihi</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {project.end_date ? new Date(project.end_date).toLocaleDateString('tr-TR') : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Durum</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        project.status === 'active' ? 'bg-green-100 text-green-800' :
                        project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.status === 'active' ? 'Aktif' :
                         project.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
                      </span>
                    </div>
                  </div>
                </div>

                {project.description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Açıklama</h3>
                    <p className="text-gray-600 dark:text-gray-300">{project.description}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">İlerleme</h3>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div className="bg-primary-600 h-2 rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{progressPercent}% tamamlandı ({completedSpools}/{totalSpools} Spool)</span>
                </div>
              </div>
            )}

            {activeTab === 'spools' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Spool veya malzeme ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <Link href="/spools/new" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 text-sm font-medium">
                    <Plus className="w-4 h-4" />
                    Yeni Spool
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3">Spool No</th>
                        <th className="px-6 py-3">Malzeme</th>
                        <th className="px-6 py-3">Durum</th>
                        <th className="px-6 py-3">Boyutlar / Çap</th>
                        <th className="px-6 py-3 text-right">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                      {filteredSpools.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-6 text-gray-500 dark:text-gray-400">
                            Projede kayıtlı spool bulunamadı.
                          </td>
                        </tr>
                      ) : (
                        filteredSpools.map((spool) => (
                          <tr key={spool.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                              {spool.name}
                            </td>
                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                              {spool.material}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                spool.status === 'completed' ? 'bg-green-100 text-green-800' :
                                spool.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {spool.status === 'completed' ? 'Tamamlandı' :
                                 spool.status === 'active' ? 'Üretimde' : 'Beklemede'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                              {spool.diameter ? `Ø ${spool.diameter}` : '-'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Link href={`/spools/${spool.id}`} className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-200">
                                Detay
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Proje Ekibi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {manager && (
                    <div className="flex items-center gap-4 p-4 border rounded-xl dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40">
                      <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-lg">
                        {(manager.full_name || 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{manager.full_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Proje Yöneticisi</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{manager.email}</p>
                      </div>
                    </div>
                  )}

                  {personnel.filter(p => p.id !== project.manager_id && p.status === 'active').slice(0, 3).map((member) => (
                    <div key={member.id} className="flex items-center gap-4 p-4 border rounded-xl dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40">
                      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold text-lg">
                        {(member.full_name || 'PE').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{member.full_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{member.position || 'Teknik Ekip'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
