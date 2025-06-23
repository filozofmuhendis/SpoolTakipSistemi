'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Download, Calendar, TrendingUp, Package, Users, Truck } from 'lucide-react'
import { useReports } from '@/hooks/useReports'
import { projectService } from '@/lib/services/projects'
import { spoolService } from '@/lib/services/spools'
import { personnelService } from '@/lib/services/personnel'
import { workOrderService } from '@/lib/services/workOrders'
import { shipmentService } from '@/lib/services/shipments'

interface Report {
  id: string
  name: string
  type: 'production' | 'personnel' | 'shipment' | 'financial'
  description: string
  lastGenerated: string
  icon: string
  color: string
}

interface ReportData {
  projects: any[]
  spools: any[]
  personnel: any[]
  workOrders: any[]
  shipments: any[]
}

export default function ReportsPage() {
  const [reports] = useState<Report[]>([
    {
      id: '1',
      name: 'Üretim Raporu',
      type: 'production',
      description: 'Günlük, haftalık ve aylık üretim performansı',
      lastGenerated: '2024-01-20',
      icon: '📊',
      color: 'blue'
    },
    {
      id: '2',
      name: 'Personel Performans Raporu',
      type: 'personnel',
      description: 'Personel verimliliği ve görev tamamlama oranları',
      lastGenerated: '2024-01-19',
      icon: '👥',
      color: 'green'
    },
    {
      id: '3',
      name: 'Sevkiyat Raporu',
      type: 'shipment',
      description: 'Sevkiyat durumları ve teslimat performansı',
      lastGenerated: '2024-01-18',
      icon: '🚚',
      color: 'orange'
    },
    {
      id: '4',
      name: 'Proje Durum Raporu',
      type: 'production',
      description: 'Proje ilerlemesi ve spool tamamlama oranları',
      lastGenerated: '2024-01-17',
      icon: '📈',
      color: 'purple'
    },
    {
      id: '5',
      name: 'Kalite Kontrol Raporu',
      type: 'production',
      description: 'Kalite standartları ve hata oranları',
      lastGenerated: '2024-01-16',
      icon: '✅',
      color: 'red'
    },
    {
      id: '6',
      name: 'Malzeme Kullanım Raporu',
      type: 'financial',
      description: 'Malzeme tüketimi ve stok durumu',
      lastGenerated: '2024-01-15',
      icon: '📦',
      color: 'indigo'
    }
  ])

  const [selectedType, setSelectedType] = useState<string>('all')
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  const { getReport, exportToExcel } = useReports()

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

  const filteredReports = reports.filter(report => 
    selectedType === 'all' || report.type === selectedType
  )

  const generateReport = async (reportType: string) => {
    if (!reportData) return

    try {
      setLoading(true)
      
      const startDate = new Date(dateRange.startDate)
      const endDate = new Date(dateRange.endDate)
      
      let reportDataToExport: any[] = []

      switch (reportType) {
        case 'production':
          reportDataToExport = generateProductionReport(reportData, startDate, endDate)
          break
        case 'personnel':
          reportDataToExport = generatePersonnelReport(reportData, startDate, endDate)
          break
        case 'shipment':
          reportDataToExport = generateShipmentReport(reportData, startDate, endDate)
          break
        case 'financial':
          reportDataToExport = generateFinancialReport(reportData, startDate, endDate)
          break
      }

      exportToExcel(reportDataToExport, reportType as any)
    } catch (error) {
      console.error('Rapor oluşturulurken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateProductionReport = (data: ReportData, startDate: Date, endDate: Date) => {
    const filteredSpools = data.spools.filter(spool => {
      const spoolDate = new Date(spool.createdAt)
      return spoolDate >= startDate && spoolDate <= endDate
    })

    return filteredSpools.map(spool => ({
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

  const generatePersonnelReport = (data: ReportData, startDate: Date, endDate: Date) => {
    return data.personnel.map(person => {
      const personWorkOrders = data.workOrders.filter(wo => wo.assignedTo === person.id)
      const completedWorkOrders = personWorkOrders.filter(wo => wo.status === 'completed')
      
      return {
        'Personel Adı': person.name,
        'Pozisyon': person.position,
        'Departman': person.department,
        'Durum': person.status,
        'İşe Başlama': new Date(person.hireDate).toLocaleDateString('tr-TR'),
        'Toplam İş Emri': personWorkOrders.length,
        'Tamamlanan İş Emri': completedWorkOrders.length,
        'Tamamlama Oranı (%)': personWorkOrders.length > 0 ? Math.round((completedWorkOrders.length / personWorkOrders.length) * 100) : 0
      }
    })
  }

  const generateShipmentReport = (data: ReportData, startDate: Date, endDate: Date) => {
    const filteredShipments = data.shipments.filter(shipment => {
      const shipmentDate = new Date(shipment.scheduledDate)
      return shipmentDate >= startDate && shipmentDate <= endDate
    })

    return filteredShipments.map(shipment => ({
      'Sevkiyat No': shipment.number,
      'Proje': shipment.projectName || 'Bilinmiyor',
      'Durum': shipment.status,
      'Öncelik': shipment.priority,
      'Hedef': shipment.destination,
      'Kargo Firması': shipment.carrier,
      'Toplam Ağırlık (kg)': shipment.totalWeight,
      'Planlanan Tarih': new Date(shipment.scheduledDate).toLocaleDateString('tr-TR'),
      'Gerçekleşen Tarih': shipment.actualDate ? new Date(shipment.actualDate).toLocaleDateString('tr-TR') : '-',
      'Takip No': shipment.trackingNumber || '-'
    }))
  }

  const generateFinancialReport = (data: ReportData, startDate: Date, endDate: Date) => {
    const projectStats = data.projects.map(project => {
      const projectSpools = data.spools.filter(spool => spool.projectId === project.id)
      const totalSpools = projectSpools.length
      const completedSpools = projectSpools.filter(spool => spool.status === 'completed').length
      
      return {
        'Proje Adı': project.name,
        'Durum': project.status,
        'Yönetici': project.managerName || 'Atanmamış',
        'Toplam Spool': totalSpools,
        'Tamamlanan Spool': completedSpools,
        'İlerleme (%)': totalSpools > 0 ? Math.round((completedSpools / totalSpools) * 100) : 0,
        'Başlangıç Tarihi': new Date(project.startDate).toLocaleDateString('tr-TR'),
        'Bitiş Tarihi': project.endDate ? new Date(project.endDate).toLocaleDateString('tr-TR') : '-'
      }
    })

    return projectStats
  }

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800',
      red: 'bg-red-50 border-red-200 text-red-800',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800'
    }
    return colorMap[color] || 'bg-gray-50 border-gray-200 text-gray-800'
  }

  return (
    <div className="p-6 w-full max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Raporlar</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Detaylı analiz ve raporlar</p>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span className="font-medium">Tarih Aralığı:</span>
          </div>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <span className="text-gray-500">-</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Tüm Rapor Türleri</option>
              <option value="production">Üretim Raporları</option>
              <option value="personnel">Personel Raporları</option>
              <option value="shipment">Sevkiyat Raporları</option>
              <option value="financial">Finansal Raporlar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{report.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{report.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{report.description}</p>
                </div>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getColorClasses(report.color)}`}>
                {report.type}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4 mr-2" />
                Son oluşturulma: {report.lastGenerated}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => generateReport(report.type)}
                  disabled={loading || !reportData}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <BarChart3 className="h-4 w-4" />
                  )}
                  Rapor Oluştur
                </button>
                <button
                  onClick={() => generateReport(report.type)}
                  disabled={loading || !reportData}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Excel
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Rapor bulunamadı</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Seçilen kriterlere uygun rapor bulunamadı.
          </p>
        </div>
      )}
    </div>
  )
}