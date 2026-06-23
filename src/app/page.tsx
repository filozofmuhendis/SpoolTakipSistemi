'use client'

import { useMemo } from 'react'
import {
  Building2,
  Users,
  ClipboardList,
  ArrowUpRight,
  Package,
  Activity as ActivityIcon
} from 'lucide-react'

// Hooks
import { useProjects } from '@/hooks/queries/useProjects'
import { useSpools } from '@/hooks/queries/useSpools'
import { usePersonnel } from '@/hooks/queries/usePersonnel'
import { useShipments } from '@/hooks/queries/useShipments'

// Components
import { StatCard } from '@/components/dashboard/StatCard'
import { ActivityList, Activity } from '@/components/dashboard/ActivityList'
import { ProjectStatusList, ProjectStatus } from '@/components/dashboard/ProjectStatusList'
import { QuickActionCard } from '@/components/dashboard/QuickActionCard'

export default function Home() {
  const { data: projects = [], isLoading: loadingProjects } = useProjects()
  const { data: spools = [], isLoading: loadingSpools } = useSpools()
  const { data: personnel = [], isLoading: loadingPersonnel } = usePersonnel()
  const { data: shipments = [], isLoading: loadingShipments } = useShipments()

  const isLoading = loadingProjects || loadingSpools || loadingPersonnel || loadingShipments

  const stats = useMemo(() => {
    if (isLoading) return null

    const activeProjects = projects.filter(p => p.status === 'active').length
    const totalSpools = spools.length
    const completedSpools = spools.filter(s => s.status === 'completed').length
    const progress = totalSpools > 0 ? ((completedSpools / totalSpools) * 100).toFixed(1) : '0'
    const activePersonelCount = personnel.filter(p => p.status === 'active').length
    const delayedShipments = shipments.filter(s => s.status === 'pending' && s.shipment_date && new Date(s.shipment_date) < new Date()).length

    return {
      activeProjects,
      totalSpools,
      completedSpools,
      progress: `${progress}%`,
      activePersonelCount,
      delayedShipments
    }
  }, [projects, spools, personnel, shipments, isLoading])

  const activities = useMemo(() => {
    if (isLoading) return []

    const allActivities: Activity[] = []

    // Add recent completed spools
    spools
      .filter(s => s.status === 'completed' && s.updated_at)
      .forEach(s => {
        allActivities.push({
          id: `spool-${s.id}`,
          type: 'spool_completed',
          title: 'Spool Tamamlandı',
          description: `${s.name} üretimi tamamlandı`,
          timestamp: new Date(s.updated_at!).toLocaleDateString('tr-TR'),
          color: 'bg-green-500'
        })
      })

    // Add recent created projects
    projects
      .filter(p => p.created_at)
      .forEach(p => {
        allActivities.push({
          id: `project-${p.id}`,
          type: 'project_created',
          title: 'Yeni Proje',
          description: `${p.name} projesi oluşturuldu`,
          timestamp: new Date(p.created_at!).toLocaleDateString('tr-TR'),
          color: 'bg-blue-500'
        })
      })

    // Add recent shipments
    shipments
      .filter(s => s.status === 'in_transit' && s.updated_at)
      .forEach(s => {
        allActivities.push({
          id: `shipment-${s.id}`,
          type: 'shipment_started',
          title: 'Sevkiyat Başladı',
          description: `Sevkiyat yola çıktı`,
          timestamp: new Date(s.updated_at!).toLocaleDateString('tr-TR'),
          color: 'bg-purple-500'
        })
      })

    return allActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)
  }, [projects, spools, shipments, isLoading])

  const projectStatuses: ProjectStatus[] = useMemo(() => {
    return projects.slice(0, 5).map(p => {
      const projectSpools = spools.filter(s => s.project_id === p.id)
      return {
        id: p.id,
        name: p.name,
        spoolCount: projectSpools.length,
        status: p.status || 'pending'
      }
    })
  }, [projects, spools])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full animate-ping"></div>
            <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-4 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-8 space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-white/20">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
            Sisteme genel bakış ve özet istatistikler
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-2xl border border-blue-100 dark:border-blue-800">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
            Sistem Durumu: Normal
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Aktif Projeler"
          value={stats?.activeProjects.toString() || '0'}
          icon={<Building2 className="w-8 h-8" />}
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Toplam Spool"
          value={stats?.totalSpools.toString() || '0'}
          icon={<Package className="w-8 h-8" />}
          color="from-purple-500 to-pink-500"
        />
        <StatCard
          title="Tamamlanma Oranı"
          value={stats?.progress || '0%'}
          icon={<ClipboardList className="w-8 h-8" />}
          color="from-emerald-500 to-teal-500"
        />
        <StatCard
          title="Aktif Personel"
          value={stats?.activePersonelCount.toString() || '0'}
          icon={<Users className="w-8 h-8" />}
          color="from-orange-500 to-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
              <ArrowUpRight className="w-5 h-5 text-blue-500" />
              <span>Hızlı İşlemler</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickActionCard
                title="Yeni Proje"
                icon="Plus"
                href="/projects/new"
                color="from-blue-500 to-indigo-500"
              />
              <QuickActionCard
                title="Spool Ekle"
                icon="Package"
                href="/spools/new"
                color="from-purple-500 to-pink-500"
              />
              <QuickActionCard
                title="İş Emri"
                icon="FileText"
                href="/work-orders/new"
                color="from-emerald-500 to-teal-500"
              />
              <QuickActionCard
                title="Sevkiyat"
                icon="Truck"
                href="/shipments/new"
                color="from-orange-500 to-red-500"
              />
            </div>
          </section>

          {/* Project Status */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-purple-500" />
                <span>Proje Durumları</span>
              </h2>
              <button className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 hover:underline">
                Tümünü Gör
              </button>
            </div>
            <ProjectStatusList projects={projectStatuses} />
          </section>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          {/* Recent Activity */}
          <section className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <ActivityIcon className="w-5 h-5 text-orange-500" />
                <span>Son Aktiviteler</span>
              </h2>
            </div>
            <ActivityList activities={activities} />
          </section>

          {/* Personnel Stats Mini Widget */}
          <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full filter blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500 rounded-full filter blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>

            <h3 className="text-lg font-bold mb-6 relative z-10">Personel Özeti</h3>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center p-3 bg-white/10 rounded-2xl backdrop-blur-lg">
                <span className="text-gray-300">Toplam Personel</span>
                <span className="text-2xl font-bold">{stats?.activePersonelCount || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/10 rounded-2xl backdrop-blur-lg">
                <span className="text-gray-300">Yöneticiler</span>
                <span className="text-xl font-bold text-purple-300">
                  {personnel.filter(p => p.position === 'manager').length}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
