'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Download, Calendar, TrendingUp, Package, Users, Truck, Filter, FileText, PieChart, Activity } from 'lucide-react'
import * as XLSX from 'xlsx'
import { projectService } from '@/lib/services/projects'
import { spoolService } from '@/lib/services/spools'
import { personnelService } from '@/lib/services/personnel'
import { workOrderService } from '@/lib/services/workOrders'
import { shipmentService } from '@/lib/services/shipments'

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
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')

  useEffect(() => {
    loadReportData()
  }, [])

  const loadReportData = async () => {
    try {
      setLoading(true)
      
      const [projects, spools, personnel, workOrders, shipments] = await Promise.all([
        projectService.getAllProjects(),
        spoolService.getAllSpools(),
        personnelService.getAllPersonnel(),
        workOrderService.getAllWorkOrders(),
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
      console.error('Rapor verisi yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredData = () => {
    if (!reportData) return null

    const startDate = new Date(dateRange.startDate)
    const endDate = new Date(dateRange.endDate)

    let filteredData = { ...reportData }

    // Tarih filtresi
    filteredData.spools = filteredData.spools.filter(spool => {
      const spoolDate = new Date(spool.createdAt)
      return spoolDate >= startDate && spoolDate <= endDate
    })

    filteredData.workOrders = filteredData.workOrders.filter(wo => {
      const woDate = new Date(wo.createdAt)
      return woDate >= startDate && woDate <= endDate
    })

    filteredData.shipments = filteredData.shipments.filter(shipment => {
      const shipmentDate = new Date(shipment.createdAt)
      return shipmentDate >= startDate && shipmentDate <= endDate
    })

    // Proje filtresi
    if (projectFilter !== 'all') {
      filteredData.spools = filteredData.spools.filter(spool => spool.projectId === projectFilter)
      filteredData.workOrders = filteredData.workOrders.filter(wo => wo.projectId === projectFilter)
    }

    // Departman filtresi
    if (departmentFilter !== 'all') {
      filteredData.personnel = filteredData.personnel.filter(person => person.department === departmentFilter)
    }

    return filteredData
  }

  const getOverviewStats = () => {
    if (!reportData) return null

    const filteredData = getFilteredData()
    if (!filteredData) return null

    const totalProjects = filteredData.projects.length
    const activeProjects = filteredData.projects.filter(p => p.status === 'active').length
    const completedProjects = filteredData.projects.filter(p => p.status === 'completed').length

    const totalSpools = filteredData.spools.length
    const completedSpools = filteredData.spools.filter(s => s.status === 'completed').length
    const activeSpools = filteredData.spools.filter(s => s.status === 'active').length

    const totalPersonnel = filteredData.personnel.length
    const activePersonnel = filteredData.personnel.filter(p => p.status === 'active').length

    const totalWorkOrders = filteredData.workOrders.length
    const completedWorkOrders = filteredData.workOrders.filter(wo => wo.status === 'completed').length

    const totalShipments = filteredData.shipments.length
    const deliveredShipments = filteredData.shipments.filter(s => s.status === 'delivered').length

    return {
      projects: { total: totalProjects, active: activeProjects, completed: completedProjects },
      spools: { total: totalSpools, completed: completedSpools, active: activeSpools },
      personnel: { total: totalPersonnel, active: activePersonnel },
      workOrders: { total: totalWorkOrders, completed: completedWorkOrders },
      shipments: { total: totalShipments, delivered: deliveredShipments }
    }
  }

  const getProjectProgressData = (): ChartData | null => {
    if (!reportData) return null

    const filteredData = getFilteredData()
    if (!filteredData) return null

    const projectProgress = filteredData.projects.map(project => {
      const projectSpools = filteredData.spools.filter(spool => spool.projectId === project.id)
      const completedSpools = projectSpools.filter(spool => spool.status === 'completed').length
      const progress = projectSpools.length > 0 ? Math.round((completedSpools / projectSpools.length) * 100) : 0

      return {
        name: project.name,
        progress,
        totalSpools: projectSpools.length,
        completedSpools
      }
    }).filter(p => p.totalSpools > 0).sort((a, b) => b.progress - a.progress).slice(0, 10)

    return {
      labels: projectProgress.map(p => p.name),
      datasets: [{
        label: 'İlerleme (%)',
        data: projectProgress.map(p => p.progress),
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

    const personnelPerformance = filteredData.personnel
      .filter(person => person.status === 'active')
      .map(person => {
        const personWorkOrders = filteredData.workOrders.filter(wo => wo.assignedTo === person.id)
        const completedWorkOrders = personWorkOrders.filter(wo => wo.status === 'completed').length
        const performance = personWorkOrders.length > 0 ? Math.round((completedWorkOrders / personWorkOrders.length) * 100) : 0

        return {
          name: person.name,
          performance,
          totalWorkOrders: personWorkOrders.length,
          completedWorkOrders
        }
      })
      .filter(p => p.totalWorkOrders > 0)
      .sort((a, b) => b.performance - a.performance)
      .slice(0, 10)

    return {
      labels: personnelPerformance.map(p => p.name),
      datasets: [{
        label: 'Performans (%)',
        data: personnelPerformance.map(p => p.performance),
        backgroundColor: personnelPerformance.map((_, i) => `hsl(${120 + i * 15}, 70%, 60%)`),
        borderColor: personnelPerformance.map((_, i) => `hsl(${120 + i * 15}, 70%, 50%)`),
        borderWidth: 1
      }]
    }
  }

  const getSpoolStatusData = (): ChartData | null => {
    if (!reportData) return null

    const filteredData = getFilteredData()
    if (!filteredData) return null

    const statusCounts = {
      pending: filteredData.spools.filter(s => s.status === 'pending').length,
      active: filteredData.spools.filter(s => s.status === 'active').length,
      completed: filteredData.spools.filter(s => s.status === 'completed').length
    }

    return {
      labels: ['Beklemede', 'Aktif', 'Tamamlandı'],
      datasets: [{
        label: 'Spool Sayısı',
        data: [statusCounts.pending, statusCounts.active, statusCounts.completed],
        backgroundColor: ['#fbbf24', '#3b82f6', '#10b981'],
        borderColor: ['#f59e0b', '#2563eb', '#059669'],
        borderWidth: 2
      }]
    }
  }

  const exportReport = async (reportType: string) => {
    if (!reportData) return

    try {
      setLoading(true)
      
      const filteredData = getFilteredData()
      if (!filteredData) return

      let reportDataToExport: any[] = []

      switch (reportType) {
        case 'production':
          reportDataToExport = generateProductionReport(filteredData)
          break
        case 'personnel':
          reportDataToExport = generatePersonnelReport(filteredData)
          break
        case 'shipment':
          reportDataToExport = generateShipmentReport(filteredData)
          break
        case 'project':
          reportDataToExport = generateProjectReport(filteredData)
          break
      }

      // Excel export işlemi
      const ws = XLSX.utils.json_to_sheet(reportDataToExport)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, reportType)
      
      const fileName = `${reportType}_raporu_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(wb, fileName)
      
      alert(`${reportType} raporu başarıyla indirildi!`)
    } catch (error) {
      console.error('Rapor export hatası:', error)
      alert('Rapor indirilirken hata oluştu!')
    } finally {
      setLoading(false)
    }
  }

  const generateProductionReport = (data: ReportData) => {
    return data.spools.map((spool: any) => ({
      'Spool Adı': spool.name,
      'Proje': spool.projectName || 'Bilinmiyor',
      'Durum': spool.status,
      'Miktar': spool.quantity,
      'Tamamlanan': spool.completedQuantity,
      'İlerleme (%)': Math.round((spool.completedQuantity / spool.quantity) * 100),
      'Başlangıç Tarihi': new Date(spool.startDate).toLocaleDateString('tr-TR'),
      'Bitiş Tarihi': spool.endDate ? new Date(spool.endDate).toLocaleDateString('tr-TR') : '-',
      'Atanan': spool.assignedToName || 'Atanmamış'
    }))
  }

  const generatePersonnelReport = (data: ReportData) => {
    return data.personnel.map((person: any) => {
      const personWorkOrders = data.workOrders.filter((wo: any) => wo.assignedTo === person.id)
      const completedWorkOrders = personWorkOrders.filter((wo: any) => wo.status === 'completed').length
      
      return {
        'Personel Adı': person.name,
        'Pozisyon': person.position,
        'Departman': person.department,
        'Durum': person.status,
        'İşe Başlama': new Date(person.hireDate).toLocaleDateString('tr-TR'),
        'Toplam İş Emri': personWorkOrders.length,
        'Tamamlanan İş Emri': completedWorkOrders,
        'Tamamlama Oranı (%)': personWorkOrders.length > 0 ? Math.round((completedWorkOrders / personWorkOrders.length) * 100) : 0
      }
    })
  }

  const generateShipmentReport = (data: ReportData) => {
    return data.shipments.map((shipment: any) => ({
      'Sevkiyat No': shipment.number,
      'Proje': shipment.projectName || 'Bilinmiyor',
      'Durum': shipment.status,
      'Hedef': shipment.destination,
      'Taşıyıcı': shipment.carrier,
      'Planlanan Tarih': new Date(shipment.scheduledDate).toLocaleDateString('tr-TR'),
      'Gerçekleşen Tarih': shipment.actualDate ? new Date(shipment.actualDate).toLocaleDateString('tr-TR') : '-',
      'Ağırlık': shipment.totalWeight
    }))
  }

  const generateProjectReport = (data: ReportData) => {
    return data.projects.map((project: any) => {
      const projectSpools = data.spools.filter((spool: any) => spool.projectId === project.id)
      const completedSpools = projectSpools.filter((spool: any) => spool.status === 'completed').length
      
      return {
        'Proje Adı': project.name,
        'Durum': project.status,
        'Başlangıç Tarihi': new Date(project.startDate).toLocaleDateString('tr-TR'),
        'Bitiş Tarihi': project.endDate ? new Date(project.endDate).toLocaleDateString('tr-TR') : '-',
        'Toplam Spool': projectSpools.length,
        'Tamamlanan Spool': completedSpools,
        'İlerleme (%)': projectSpools.length > 0 ? Math.round((completedSpools / projectSpools.length) * 100) : 0
      }
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Raporlar yükleniyor...</p>
        </div>
      </div>
    )
  }

  const stats = getOverviewStats()
  const projectProgressData = getProjectProgressData()
  const personnelPerformanceData = getPersonnelPerformanceData()
  const spoolStatusData = getSpoolStatusData()

  return (
    <div className="p-6 w-full max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Raporlar</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Üretim, personel ve proje performans raporları
          </p>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Başlangıç Tarihi
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bitiş Tarihi
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Proje
            </label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Tüm Projeler</option>
              {reportData?.projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Departman
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Tüm Departmanlar</option>
              {Array.from(new Set(reportData?.personnel.map(p => p.department) || [])).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Rapor Türleri */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => setSelectedReport('overview')}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedReport === 'overview'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            <div className="text-left">
              <h3 className="font-semibold">Genel Bakış</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Özet istatistikler</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setSelectedReport('production')}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedReport === 'production'
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-green-500" />
            <div className="text-left">
              <h3 className="font-semibold">Üretim</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Spool ve proje raporları</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setSelectedReport('personnel')}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedReport === 'personnel'
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-purple-500" />
            <div className="text-left">
              <h3 className="font-semibold">Personel</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Performans analizi</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setSelectedReport('shipment')}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedReport === 'shipment'
              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <Truck className="w-6 h-6 text-orange-500" />
            <div className="text-left">
              <h3 className="font-semibold">Sevkiyat</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Teslimat durumları</p>
            </div>
          </div>
        </button>
      </div>

      {/* Rapor İçeriği */}
      {selectedReport === 'overview' && stats && (
        <div className="space-y-6">
          {/* Genel İstatistikler */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Proje</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.projects.total}</p>
                  <p className="text-xs text-gray-500">{stats.projects.active} aktif</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Spool</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.spools.total}</p>
                  <p className="text-xs text-gray-500">{stats.spools.completed} tamamlandı</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Personel</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.personnel.total}</p>
                  <p className="text-xs text-gray-500">{stats.personnel.active} aktif</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Activity className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">İş Emirleri</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.workOrders.total}</p>
                  <p className="text-xs text-gray-500">{stats.workOrders.completed} tamamlandı</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Truck className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sevkiyat</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.shipments.total}</p>
                  <p className="text-xs text-gray-500">{stats.shipments.delivered} teslim edildi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Grafikler */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Proje İlerlemesi */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Proje İlerlemesi</h3>
              {projectProgressData ? (
                <div className="space-y-3">
                  {projectProgressData.labels.map((label, index) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]">
                        {label}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full"
                            style={{ 
                              width: `${projectProgressData.datasets[0].data[index]}%`,
                              backgroundColor: projectProgressData.datasets[0].backgroundColor[index]
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8 text-right">
                          {projectProgressData.datasets[0].data[index]}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Veri bulunamadı</p>
              )}
            </div>

            {/* Personel Performansı */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Personel Performansı</h3>
              {personnelPerformanceData ? (
                <div className="space-y-3">
                  {personnelPerformanceData.labels.map((label, index) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]">
                        {label}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full"
                            style={{ 
                              width: `${personnelPerformanceData.datasets[0].data[index]}%`,
                              backgroundColor: personnelPerformanceData.datasets[0].backgroundColor[index]
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8 text-right">
                          {personnelPerformanceData.datasets[0].data[index]}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Veri bulunamadı</p>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'production' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Üretim Raporu</h2>
            <button
              onClick={() => exportReport('production')}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {loading ? 'Hazırlanıyor...' : 'Excel İndir'}
            </button>
          </div>

          {/* Spool Durumu */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Spool Durumu</h3>
            {spoolStatusData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {spoolStatusData.labels.map((label, index) => (
                  <div key={label} className="text-center p-4 rounded-lg border">
                    <div 
                      className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: spoolStatusData.datasets[0].backgroundColor[index] }}
                    >
                      {spoolStatusData.datasets[0].data[index]}
                    </div>
                    <p className="font-medium">{label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Veri bulunamadı</p>
            )}
          </div>

          {/* Spool Listesi */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Spool Detayları</h3>
            {reportData && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Spool Adı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Proje
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        İlerleme
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Atanan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {getFilteredData()?.spools.slice(0, 10).map((spool: any) => {
                      const progress = Math.round((spool.completedQuantity / spool.quantity) * 100)
                      return (
                        <tr key={spool.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {spool.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {spool.projectName || 'Bilinmiyor'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              spool.status === 'completed' ? 'bg-green-100 text-green-800' :
                              spool.status === 'active' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {spool.status === 'completed' ? 'Tamamlandı' :
                               spool.status === 'active' ? 'Aktif' : 'Beklemede'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                <div 
                                  className="h-2 rounded-full bg-blue-500"
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">{progress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {spool.assignedToName || 'Atanmamış'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedReport === 'personnel' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Personel Raporu</h2>
            <button
              onClick={() => exportReport('personnel')}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {loading ? 'Hazırlanıyor...' : 'Excel İndir'}
            </button>
          </div>

          {/* Departman Dağılımı */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Departman Dağılımı</h3>
            {reportData && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from(new Set(reportData.personnel.map(p => p.department))).map(dept => {
                  const deptPersonnel = reportData.personnel.filter(p => p.department === dept)
                  const activePersonnel = deptPersonnel.filter(p => p.status === 'active').length
                  
                  return (
                    <div key={dept} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">{dept}</h4>
                      <p className="text-2xl font-bold text-blue-600">{deptPersonnel.length}</p>
                      <p className="text-sm text-gray-500">{activePersonnel} aktif</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Personel Performans Tablosu */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Personel Performans Detayları</h3>
            {reportData && (
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
                        Toplam İş Emri
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Tamamlanan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Performans
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {getFilteredData()?.personnel.slice(0, 10).map((person: any) => {
                      const personWorkOrders = reportData.workOrders.filter((wo: any) => wo.assignedTo === person.id)
                      const completedWorkOrders = personWorkOrders.filter((wo: any) => wo.status === 'completed').length
                      const performance = personWorkOrders.length > 0 ? Math.round((completedWorkOrders / personWorkOrders.length) * 100) : 0
                      
                      return (
                        <tr key={person.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {person.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {person.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {personWorkOrders.length}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {completedWorkOrders}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                <div 
                                  className="h-2 rounded-full bg-green-500"
                                  style={{ width: `${performance}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">{performance}%</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedReport === 'shipment' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Sevkiyat Raporu</h2>
            <button
              onClick={() => exportReport('shipment')}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {loading ? 'Hazırlanıyor...' : 'Excel İndir'}
            </button>
          </div>

          {/* Sevkiyat Durumu */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Sevkiyat Durumu</h3>
            {reportData && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['pending', 'in_transit', 'delivered', 'cancelled'].map(status => {
                  const count = reportData.shipments.filter(s => s.status === status).length
                  const labels = {
                    pending: 'Beklemede',
                    in_transit: 'Yolda',
                    delivered: 'Teslim Edildi',
                    cancelled: 'İptal Edildi'
                  }
                  const colors = {
                    pending: 'bg-yellow-500',
                    in_transit: 'bg-blue-500',
                    delivered: 'bg-green-500',
                    cancelled: 'bg-red-500'
                  }
                  
                  return (
                    <div key={status} className="text-center p-4 border rounded-lg">
                      <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold ${colors[status as keyof typeof colors]}`}>
                        {count}
                      </div>
                      <p className="font-medium">{labels[status as keyof typeof labels]}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sevkiyat Listesi */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Sevkiyat Detayları</h3>
            {reportData && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Sevkiyat No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Proje
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Hedef
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Planlanan Tarih
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {getFilteredData()?.shipments.slice(0, 10).map((shipment: any) => (
                      <tr key={shipment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {shipment.number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {shipment.projectName || 'Bilinmiyor'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            shipment.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                            shipment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {shipment.status === 'delivered' ? 'Teslim Edildi' :
                             shipment.status === 'in_transit' ? 'Yolda' :
                             shipment.status === 'cancelled' ? 'İptal Edildi' : 'Beklemede'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {shipment.destination}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(shipment.scheduledDate).toLocaleDateString('tr-TR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}