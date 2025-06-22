'use client'

import { useState } from 'react'
import { BarChart3, Download, Calendar, TrendingUp, Package, Users, Truck } from 'lucide-react'

interface Report {
  id: string
  name: string
  type: 'production' | 'personnel' | 'shipment' | 'financial'
  description: string
  lastGenerated: string
  icon: string
  color: string
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

  const filteredReports = reports.filter(report => 
    selectedType === 'all' || report.type === selectedType
  )

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'green': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'orange': return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
      case 'purple': return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
      case 'red': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'indigo': return 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
      default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'production': return 'Üretim'
      case 'personnel': return 'Personel'
      case 'shipment': return 'Sevkiyat'
      case 'financial': return 'Finansal'
      default: return 'Diğer'
    }
  }

  return (
    <div className="p-6 w-full max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Raporlar</h1>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Tarih Aralığı
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Toplu İndir
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Üretim</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1,248</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aktif Personel</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">24</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bekleyen Sevkiyat</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ortalama Verimlilik</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">87%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedType === 'all'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setSelectedType('production')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedType === 'production'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Üretim
          </button>
          <button
            onClick={() => setSelectedType('personnel')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedType === 'personnel'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Personel
          </button>
          <button
            onClick={() => setSelectedType('shipment')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedType === 'shipment'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Sevkiyat
          </button>
          <button
            onClick={() => setSelectedType('financial')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedType === 'financial'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Finansal
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div key={report.id} className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border ${getColorClasses(report.color)}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{report.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{report.name}</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{getTypeText(report.type)}</span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {report.description}
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
              <span>Son oluşturulma:</span>
              <span>{new Date(report.lastGenerated).toLocaleDateString('tr-TR')}</span>
            </div>
            
            <div className="flex gap-2">
              <button className="flex-1 btn-secondary text-sm">
                <BarChart3 className="w-4 h-4 mr-1" />
                Görüntüle
              </button>
              <button className="flex-1 btn-primary text-sm">
                <Download className="w-4 h-4 mr-1" />
                İndir
              </button>
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