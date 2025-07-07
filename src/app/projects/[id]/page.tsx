'use client'

import { useState } from 'react'
import { ArrowLeft, Users, FileText, Activity, Calendar, Clock, Building, Edit, Trash, Plus, Search } from 'lucide-react'
import Link from 'next/link'

export default function ProjectDetail({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'spools' | 'team' | 'timeline'>('overview')

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/projects" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Test Projesi</h1>
              <p className="text-gray-500">PRJ-001</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
              <Edit className="w-5 h-5" />
            </button>
            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
              <Trash className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <Users className="w-8 h-8 text-blue-500 mb-2" />
            <p className="text-gray-600">Ekip Üyeleri</p>
            <p className="text-2xl font-bold">12</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <FileText className="w-8 h-8 text-green-500 mb-2" />
            <p className="text-gray-600">Toplam Spool</p>
            <p className="text-2xl font-bold">24</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <Activity className="w-8 h-8 text-yellow-500 mb-2" />
            <p className="text-gray-600">Aktif İşler</p>
            <p className="text-2xl font-bold">8</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <Clock className="w-8 h-8 text-purple-500 mb-2" />
            <p className="text-gray-600">Kalan Süre</p>
            <p className="text-2xl font-bold">45 gün</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b">
            <nav className="flex">
              {['overview', 'spools', 'team', 'timeline'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-4 text-sm font-medium ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Proje Detayları</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Müşteri</p>
                      <p className="font-medium">ABC Şirketi</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Başlangıç Tarihi</p>
                      <p className="font-medium">01.01.2024</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Bitiş Tarihi</p>
                      <p className="font-medium">01.03.2024</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Durum</p>
                      <p className="font-medium">Aktif</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Açıklama</h3>
                  <p className="text-gray-600">
                    Proje açıklaması buraya gelecek...
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">İlerleme</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">60% tamamlandı</span>
                </div>
              </div>
            )}

            {activeTab === 'spools' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Spool ara..."
                      className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    />
                  </div>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Yeni Spool
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Spool No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Durum
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          İlerleme
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Atanan Kişi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Son Güncelleme
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">SP-001</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Üretimde
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-32">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                            </div>
                            <span className="text-xs text-gray-500">60%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Ahmet Yılmaz
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          2024-01-20 14:30
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Team ve Timeline sekmeleri buraya eklenecek */}
          </div>
        </div>
      </div>
    </div>
  )
}