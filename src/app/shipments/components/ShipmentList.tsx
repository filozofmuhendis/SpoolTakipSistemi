'use client'

import { useState } from 'react'
import { Search, Filter, FileText, Calendar, Building } from 'lucide-react'

interface Shipment {
  id: string
  date: string
  type: 'incoming' | 'outgoing-product' | 'outgoing-material'
  company: string
  waybillNo: string
  description: string
  spoolNumber?: string
  documents: string[]
}

interface FilterOptions {
  dateRange: { start: string; end: string }
  type: string
  company: string
}

export default function ShipmentList() {
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {
      start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    type: '',
    company: ''
  })

  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Ara..."
            className="w-full pl-10 pr-4 py-2 border rounded"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 bg-gray-100 rounded flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtrele
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded shadow-lg border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Tarih Aralığı</label>
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters({
                    ...filters,
                    dateRange: { ...filters.dateRange, start: e.target.value }
                  })}
                  className="flex-1 p-2 border rounded"
                />
                <span>-</span>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters({
                    ...filters,
                    dateRange: { ...filters.dateRange, end: e.target.value }
                  })}
                  className="flex-1 p-2 border rounded"
                />
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Sevkiyat Türü</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="">Tümü</option>
                <option value="incoming">Gelen Malzeme</option>
                <option value="outgoing-product">Giden Ürün</option>
                <option value="outgoing-material">Giden Malzeme</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Firma</label>
              <input
                type="text"
                value={filters.company}
                onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                placeholder="Firma adı"
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* Shipments Table */}
      <div className="bg-white rounded shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tarih</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tür</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Firma</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">İrsaliye No</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Açıklama</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Belgeler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* Örnek satır */}
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm">2024-01-20</td>
              <td className="px-4 py-3 text-sm">
                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Gelen Malzeme
                </span>
              </td>
              <td className="px-4 py-3 text-sm">ABC Ltd.</td>
              <td className="px-4 py-3 text-sm">IRS-001</td>
              <td className="px-4 py-3 text-sm">Test sevkiyat</td>
              <td className="px-4 py-3 text-sm">
                <button className="text-blue-500 hover:text-blue-700">
                  <FileText className="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}