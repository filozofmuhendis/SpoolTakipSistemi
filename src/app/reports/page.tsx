'use client'

import { useState, useEffect, useRef } from 'react'
import { BarChart3, Download, Calendar, TrendingUp, Package, Users, Truck, Filter, FileText, PieChart, Activity, Upload, File, Trash2, Eye, Save, X } from 'lucide-react'
import * as XLSX from 'xlsx'
import { projectService } from '@/lib/services/projects'
import { spoolService } from '@/lib/services/spools'
import { personnelService } from '@/lib/services/personnel'
import { jobOrderService } from '@/lib/services/workOrders'
import { shipmentService } from '@/lib/services/shipments'
import { storageService } from '@/lib/services/storage'
import { FileUpload } from '@/lib/services/storage'
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
  const [savedReports, setSavedReports] = useState<FileUpload[]>([])
  const [loadingReports, setLoadingReports] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReportData()
    loadSavedReports()
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

  const loadSavedReports = async () => {
    try {
      setLoadingReports(true)
      const reports = await storageService.getFilesByEntity('project', 'reports')
      setSavedReports(reports)
    } catch (error) {
      console.error('Kayıtlı raporlar yüklenirken hata:', error)
    } finally {
      setLoadingReports(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Dosya tipi ve boyut kontrolü
    const validFiles = files.filter(file => {
      const allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/pdf', 'text/csv']
      const maxSize = 10 * 1024 * 1024 // 10MB
      
      if (!storageService.isValidFileType(file, allowedTypes)) {
        showToast({ type: 'error', message: `${file.name} dosya tipi desteklenmiyor.` })
        return false
      }
      
      if (!storageService.isValidFileSize(file, maxSize)) {
        showToast({ type: 'error', message: `${file.name} dosyası çok büyük. Maksimum 10MB olmalı.` })
        return false
      }
      
      return true
    })
    
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles])
    }
  }

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadReportTemplates = async () => {
    const uploadPromises = selectedFiles.map(async (file) => {
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
      
      try {
        const uploadedFile = await storageService.uploadFile(file, 'project', 'templates')
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
        return uploadedFile
      } catch (error) {
        console.log('Dosya yükleme hatası:', error)
        setUploadProgress(prev => ({ ...prev, [file.name]: -1 }))
        return null
      }
    })

    const results = await Promise.all(uploadPromises)
    const successfulUploads = results.filter(result => result !== null)
    
    if (successfulUploads.length > 0) {
      showToast({ type: 'success', message: `${successfulUploads.length} rapor şablonu başarıyla yüklendi.` })
      setSelectedFiles([])
      setShowUploadModal(false)
    }
    
    // Progress'i temizle
    setTimeout(() => {
      setUploadProgress({})
    }, 3000)
  }

  const saveReportToSystem = async (reportType: string, data: any[]) => {
    try {
      // Excel dosyası oluştur
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Rapor')
      
      // Excel dosyasını blob'a çevir
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      
      // File objesi oluştur
      const fileName = `${reportType}-raporu-${new Date().toISOString().split('T')[0]}.xlsx`
      const file = new (window as any).File([blob], fileName)
      
      // Dosyayı yükle
      const uploadedFile = await storageService.uploadFile(file, 'project', 'saved')
      
      if (uploadedFile) {
        setSavedReports(prev => [uploadedFile, ...prev])
        showToast({ type: 'success', message: 'Rapor sisteme kaydedildi!' })
      }
    } catch (error) {
      console.error('Rapor kaydetme hatası:', error)
      showToast({ type: 'error', message: 'Rapor kaydedilirken hata oluştu.' })
    }
  }

  const deleteSavedReport = async (fileId: string) => {
    try {
      const success = await storageService.deleteFile(fileId)
      if (success) {
        setSavedReports(prev => prev.filter(f => f.id !== fileId))
        showToast({ type: 'success', message: 'Rapor silindi' })
      } else {
        showToast({ type: 'error', message: 'Rapor silinirken hata oluştu' })
      }
    } catch (error) {
      console.error('Rapor silme hatası:', error)
      showToast({ type: 'error', message: 'Rapor silinirken hata oluştu' })
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <File className="w-4 h-4 text-green-500" />
    if (fileType === 'application/pdf') return <File className="w-4 h-4 text-red-500" />
    if (fileType === 'text/csv') return <File className="w-4 h-4 text-blue-500" />
    return <File className="w-4 h-4 text-gray-500" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  const exportAndSaveReport = async (reportType: string) => {
    if (!reportData) return

    try {
      let data: any[] = []

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
          break
        case 'personnel':
          data = reportData.personnel.map(person => ({
            ID: person.id,
            Ad: person.name,
            Rol: person.role,
            Email: person.email
          }))
          break
        case 'shipment':
          data = reportData.shipments.map(shipment => ({
            ID: shipment.id,
            'Proje ID': shipment.project_id,
            'Sevkiyat Tarihi': shipment.shipment_date,
            Durum: shipment.status,
            Notlar: shipment.notes
          }))
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
          break
        default:
          return
      }

      // Hem indir hem kaydet
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Rapor')
      XLSX.writeFile(wb, `${reportType}-raporu.xlsx`)

      // Sisteme kaydet
      await saveReportToSystem(reportType, data)

      showToast({ type: 'success', message: 'Rapor indirildi ve sisteme kaydedildi!' })
    } catch (error) {
      showToast({ type: 'error', message: 'Rapor işlemi sırasında bir hata oluştu.' })
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
            onClick={() => setShowUploadModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Şablon Yükle
          </button>
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

      {/* Kayıtlı Raporlar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Kayıtlı Raporlar</h3>
          <div className="flex gap-2">
            <button
              onClick={() => exportAndSaveReport('production')}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Save className="w-4 h-4" />
              Spool Raporu Kaydet
            </button>
            <button
              onClick={() => exportAndSaveReport('personnel')}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Save className="w-4 h-4" />
              Personel Raporu Kaydet
            </button>
          </div>
        </div>
        
        {loadingReports ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm text-gray-600">Raporlar yükleniyor...</span>
          </div>
        ) : savedReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedReports.map((file) => (
              <div
                key={file.id}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {getFileIcon(file.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {storageService.formatFileSize(file.size)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(file.uploadedAt)}
                      </p>
                        </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 btn-secondary flex items-center justify-center gap-1 text-sm"
                    title="Görüntüle"
                  >
                    <Eye className="w-3 h-3" />
                    Görüntüle
                  </a>
                  <a
                    href={file.url}
                    download={file.name}
                    className="flex-1 btn-primary flex items-center justify-center gap-1 text-sm"
                    title="İndir"
                  >
                    <Download className="w-3 h-3" />
                    İndir
                  </a>
                  <button
                    onClick={() => file.id && deleteSavedReport(file.id)}
                    className="btn-danger flex items-center justify-center gap-1 text-sm"
                    title="Sil"
                  >
                    <Trash2 className="w-3 h-3" />
                    Sil
                  </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
          <div className="text-center py-8 text-gray-500">
            <File className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>Henüz kayıtlı rapor bulunmuyor.</p>
          </div>
              )}
            </div>

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

      {/* Şablon Yükleme Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Rapor Şablonu Yükle</h2>
            <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700"
            >
                <X className="w-6 h-6" />
            </button>
          </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Rapor şablonlarını seçmek için{' '}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-500 font-medium"
                    >
                      tıklayın
                    </button>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Excel, PDF, CSV dosyaları (Maksimum 10MB)
                  </p>
                    </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".xlsx,.xls,.pdf,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
          </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Seçilen Dosyalar ({selectedFiles.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                      >
                        <div className="flex items-center space-x-2">
                          {getFileIcon(file.type)}
                          <span className="text-sm font-medium">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({storageService.formatFileSize(file.size)})
                          </span>
                              </div>
            <button
                          type="button"
                          onClick={() => removeSelectedFile(index)}
                          className="text-red-500 hover:text-red-700"
            >
                          <Trash2 className="w-4 h-4" />
            </button>
          </div>
                    ))}
                    </div>
              </div>
            )}

              {Object.keys(uploadProgress).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Yükleme İlerlemesi</h4>
                  {Object.entries(uploadProgress).map(([fileName, progress]) => (
                    <div key={fileName} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {fileName}
                        </span>
                        <span className="text-sm text-gray-500">
                          {progress === -1 ? 'Hata' : `${progress}%`}
                        </span>
                      </div>
                      {progress !== -1 && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
              </div>
            )}
          </div>
                  ))}
        </div>
      )}

              <div className="flex justify-end gap-4 pt-4">
            <button
                  onClick={() => setShowUploadModal(false)}
                  className="btn-secondary"
                >
                  İptal
                </button>
                <button
                  onClick={uploadReportTemplates}
                  disabled={selectedFiles.length === 0}
                  className="btn-primary"
            >
                  Yükle
            </button>
          </div>
                      </div>
          </div>
        </div>
      )}
    </div>
  )
}
