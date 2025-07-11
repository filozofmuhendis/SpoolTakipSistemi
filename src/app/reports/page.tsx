'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Download, Calendar, TrendingUp, Package, Users, Truck, Filter, FileText, PieChart, Activity } from 'lucide-react'
import * as XLSX from 'xlsx'
import { projectService } from '@/lib/services/projects'
import { spoolService } from '@/lib/services/spools'
import { personnelService } from '@/lib/services/personnel'
import { jobOrderService } from '@/lib/services/workOrders'
import { shipmentService } from '@/lib/services/shipments'
import Loading from '@/components/ui/Loading'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import { useToast } from '@/components/ui/ToastProvider'

interface ReportData {
  projects: any[]
  spools: any[]
  personnel: any[]
  workOrders: any[]
  shipments: any[]
}

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string[]
    borderColor: string[]
    borderWidth: number
  }[]
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedReport, setSelectedReport] = useState<string>('overview')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const { showToast } = useToast()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReportData()
  }, [])

  const loadReportData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [projects, spools, personnel, workOrders, shipments] = await Promise.all([
        projectService.getAllProjects(),
        spoolService.getAllSpools(),
        personnelService.getAllPersonnel(),
        jobOrderService.getAllJobOrders(),
        shipmentService.getAllShipments()
      ])

      setReportData({
        projects,
        spools,
        personnel,
        workOrders,
        shipments
      })
    } catch (error) {
      setError('Rapor verisi yüklenirken bir hata oluştu.')
      showToast({ type: 'error', message: 'Rapor verisi yüklenirken bir hata oluştu.' })
    } finally {
      setLoading(false)
    }
  }

  const getFilteredData = () => {
    if (!reportData) return null

    let filteredData = { ...reportData }

    // Proje filtresi
    if (projectFilter !== 'all') {
      filteredData.spools = filteredData.spools.filter(spool => spool.project_id === projectFilter)
      filteredData.workOrders = filteredData.workOrders.filter(wo => wo.project_id === projectFilter)
    }

    return filteredData
  }

  const getOverviewStats = () => {
    if (!reportData) return null

    const filteredData = getFilteredData()
    if (!filteredData) return null

    const totalProjects = filteredData.projects.length
    const totalSpools = filteredData.spools.length
    const totalPersonnel = filteredData.personnel.length
    const totalWorkOrders = filteredData.workOrders.length
    const totalShipments = filteredData.shipments.length

    return {
      projects: { total: totalProjects },
      spools: { total: totalSpools },
      personnel: { total: totalPersonnel },
      workOrders: { total: totalWorkOrders },
      shipments: { total: totalShipments }
    }
  }

  const getProjectProgressData = (): ChartData | null => {
    if (!reportData) return null

    const filteredData = getFilteredData()
    if (!filteredData) return null

    const projectProgress = filteredData.projects.map(project => {
      const projectSpools = filteredData.spools.filter(spool => spool.project_id === project.id)
      return {
        name: project.name,
        totalSpools: projectSpools.length
      }
    }).filter(p => p.totalSpools > 0).sort((a, b) => b.totalSpools - a.totalSpools).slice(0, 10)

    return {
      labels: projectProgress.map(p => p.name),
      datasets: [{
        label: 'Spool Sayısı',
        data: projectProgress.map(p => p.totalSpools),
        backgroundColor: projectProgress.map((_, i) => `hsl(${200 + i * 20}, 70%, 60%)`),
        borderColor: projectProgress.map((_, i) => `hsl(${200 + i * 20}, 70%, 50%)`),
        borderWidth: 1
      }]
    }
  }

  const getPersonnelPerformanceData = (): ChartData | null => {
    if (!reportData) return null

    const filteredData = getFilteredData()
    if (!filteredData) return null

    const personnelPerformance = filteredData.personnel.map(person => {
      const personWorkOrders = filteredData.workOrders.filter(wo => wo.created_by === person.id)
      return {
        name: person.name,
        totalWorkOrders: personWorkOrders.length
      }
    }).filter(p => p.totalWorkOrders > 0).sort((a, b) => b.totalWorkOrders - a.totalWorkOrders).slice(0, 10)

    return {
      labels: personnelPerformance.map(p => p.name),
      datasets: [{
        label: 'İş Emri Sayısı',
        data: personnelPerformance.map(p => p.totalWorkOrders),
        backgroundColor: personnelPerformance.map((_, i) => `hsl(${120 + i * 20}, 70%, 60%)`),
        borderColor: personnelPerformance.map((_, i) => `hsl(${120 + i * 20}, 70%, 50%)`),
        borderWidth: 1
      }]
    }
  }

  const getSpoolStatusData = (): ChartData | null => {
    if (!reportData) return null

    const filteredData = getFilteredData()
    if (!filteredData) return null

    const statusCounts = filteredData.spools.reduce((acc, spool) => {
      const status = spool.status || 'unknown'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const labels = Object.keys(statusCounts)
    const data = Object.values(statusCounts) as number[]

    return {
      labels,
      datasets: [{
        label: 'Spool Sayısı',
        data,
        backgroundColor: labels.map((_, i) => `hsl(${i * 60}, 70%, 60%)`),
        borderColor: labels.map((_, i) => `hsl(${i * 60}, 70%, 50%)`),
        borderWidth: 1
      }]
    }
  }

  const exportReport = async (reportType: string) => {
    if (!reportData) return

    try {
      let data: any[] = []
      let fileName = ''

      switch (reportType) {
        case 'production':
          data = reportData.spools.map(spool => ({
            ID: spool.id,
            'Proje ID': spool.project_id,
            Ad: spool.name,
            Malzeme: spool.material,
            Çap: spool.diameter,
            Kalınlık: spool.thickness,
            Uzunluk: spool.length,
            Ağırlık: spool.weight,
            Durum: spool.status,
            Notlar: spool.notes
          }))
          fileName = 'spool-raporu.xlsx'
          break
        case 'personnel':
          data = reportData.personnel.map(person => ({
            ID: person.id,
            Ad: person.name,
            Rol: person.role,
            Email: person.email
          }))
          fileName = 'personel-raporu.xlsx'
          break
        case 'shipment':
          data = reportData.shipments.map(shipment => ({
            ID: shipment.id,
            'Proje ID': shipment.project_id,
            'Sevkiyat Tarihi': shipment.shipment_date,
            Durum: shipment.status,
            Notlar: shipment.notes
          }))
          fileName = 'sevkiyat-raporu.xlsx'
          break
        case 'project':
          data = reportData.projects.map(project => ({
            ID: project.id,
            Ad: project.name,
            'Tersane': project.shipyard,
            Gemi: project.ship,
            'Başlangıç Tarihi': project.start_date,
            'Teslim Tarihi': project.delivery_date,
            'Müşteri Adı': project.client_name,
            Açıklama: project.description,
            'Bitiş Tarihi': project.end_date,
            Durum: project.status
          }))
          fileName = 'proje-raporu.xlsx'
          break
        default:
          return
      }

      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Rapor')
      XLSX.writeFile(wb, fileName)

      showToast({ type: 'success', message: 'Rapor başarıyla indirildi!' })
    } catch (error) {
      showToast({ type: 'error', message: 'Rapor indirilirken bir hata oluştu.' })
    }
  }

  if (loading) {
    return <Loading text="Rapor verisi yükleniyor..." />
  }

  if (error) {
    return <ErrorState title="Hata" description={error} />
  }

  if (!reportData) {
    return <EmptyState title="Veri bulunamadı" description="Rapor verisi yüklenemedi." />
  }

  const stats = getOverviewStats()
  const projectChartData = getProjectProgressData()
  const personnelChartData = getPersonnelPerformanceData()
  const spoolChartData = getSpoolStatusData()

  return (
    <div className="p-6 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Raporlar</h1>
        <div className="flex gap-2">
          <button
            onClick={() => exportReport('production')}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Spool Raporu
          </button>
          <button
            onClick={() => exportReport('personnel')}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Personel Raporu
          </button>
          <button
            onClick={() => exportReport('shipment')}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Sevkiyat Raporu
          </button>
          <button
            onClick={() => exportReport('project')}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Proje Raporu
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Projeler</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.projects.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Spool&apos;lar</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.spools.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Personel</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.personnel.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">İş Emirleri</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.workOrders.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Truck className="w-8 h-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sevkiyatlar</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.shipments.total}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {projectChartData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Proje Spool Dağılımı</h3>
            <div className="h-64">
              {/* Chart component would go here */}
              <div className="text-center text-gray-500">Grafik bileşeni burada olacak</div>
            </div>
          </div>
        )}

        {personnelChartData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Personel İş Emri Dağılımı</h3>
            <div className="h-64">
              {/* Chart component would go here */}
              <div className="text-center text-gray-500">Grafik bileşeni burada olacak</div>
            </div>
          </div>
        )}

        {spoolChartData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Spool Durum Dağılımı</h3>
            <div className="h-64">
              {/* Chart component would go here */}
              <div className="text-center text-gray-500">Grafik bileşeni burada olacak</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
