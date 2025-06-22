'use client'

import { useState } from 'react'
import { ArrowLeft, UserCircle, Building, Mail, Phone, Calendar, Briefcase, Edit, Trash, Activity } from 'lucide-react'
import Link from 'next/link'

export default function PersonnelDetail({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'history'>('overview')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/personnel" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Ahmet Yılmaz</h1>
              <p className="text-gray-500">Üretim Mühendisi</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Düzenle
            </button>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
            >
              <Trash className="w-4 h-4" />
              Pasife Al
            </button>
          </div>
        </div>

        {/* Personnel Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-start gap-6">
            <div className="bg-gray-100 p-4 rounded-full">
              <UserCircle className="w-24 h-24 text-gray-500" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 flex-1">
              <div>
                <p className="text-sm text-gray-500">Departman</p>
                <div className="flex items-center gap-2 mt-1">
                  <Building className="w-4 h-4 text-gray-400" />
                  <p className="font-medium">Üretim Departmanı</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="font-medium">ahmet.yilmaz@firma.com</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Telefon</p>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="font-medium">+90 555 123 4567</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">İşe Başlama Tarihi</p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="font-medium">01.01.2023</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Durum</p>
                <div className="flex items-center gap-2 mt-1">
                  <Activity className="w-4 h-4 text-green-500" />
                  <p className="font-medium text-green-600">Aktif</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="border-b">
            <nav className="flex">
              {['overview', 'projects', 'history'].map((tab) => (
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
                  <h3 className="text-lg font-semibold mb-4">Aktif Projeler</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium">Test Projesi 1</h4>
                      <p className="text-sm text-gray-500">PRJ-001</p>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                        <span className="text-xs text-gray-500">60% tamamlandı</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal will be added here */}
      {/* Delete Confirmation Modal will be added here */}
    </div>
  )
}