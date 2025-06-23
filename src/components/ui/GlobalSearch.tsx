'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Package, Users, BarChart3, Truck, FileText } from 'lucide-react'
import { projectService } from '@/lib/services/projects'
import { spoolService } from '@/lib/services/spools'
import { personnelService } from '@/lib/services/personnel'
import { workOrderService } from '@/lib/services/workOrders'
import { shipmentService } from '@/lib/services/shipments'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: string
  type: 'project' | 'spool' | 'personnel' | 'workOrder' | 'shipment'
  title: string
  subtitle: string
  status?: string
  url: string
  icon: React.ReactNode
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length >= 2) {
      performSearch()
    } else {
      setResults([])
      setIsOpen(false)
    }
  }, [query])

  const performSearch = async () => {
    if (query.length < 2) return

    setLoading(true)
    setIsOpen(true)

    try {
      const searchResults: SearchResult[] = []

      // Projelerde arama
      const projects = await projectService.getAllProjects()
      const projectResults = projects
        .filter(project => 
          project.name.toLowerCase().includes(query.toLowerCase()) ||
          project.description?.toLowerCase().includes(query.toLowerCase())
        )
        .map(project => ({
          id: project.id,
          type: 'project' as const,
          title: project.name,
          subtitle: project.description || 'Açıklama yok',
          status: project.status,
          url: `/projects/${project.id}`,
          icon: <BarChart3 className="w-4 h-4" />
        }))

      // Spool'larda arama
      const spools = await spoolService.getAllSpools()
      const spoolResults = spools
        .filter(spool => 
          spool.name.toLowerCase().includes(query.toLowerCase()) ||
          spool.description?.toLowerCase().includes(query.toLowerCase())
        )
        .map(spool => ({
          id: spool.id,
          type: 'spool' as const,
          title: spool.name,
          subtitle: spool.projectName || 'Proje bilgisi yok',
          status: spool.status,
          url: `/spools/${spool.id}`,
          icon: <Package className="w-4 h-4" />
        }))

      // Personelde arama
      const personnel = await personnelService.getAllPersonnel()
      const personnelResults = personnel
        .filter(person => 
          person.name.toLowerCase().includes(query.toLowerCase()) ||
          person.email.toLowerCase().includes(query.toLowerCase()) ||
          person.department.toLowerCase().includes(query.toLowerCase())
        )
        .map(person => ({
          id: person.id,
          type: 'personnel' as const,
          title: person.name,
          subtitle: `${person.department} - ${person.position}`,
          status: person.status,
          url: `/personnel/${person.id}`,
          icon: <Users className="w-4 h-4" />
        }))

      // İş emirlerinde arama
      const workOrders = await workOrderService.getAllWorkOrders()
      const workOrderResults = workOrders
        .filter(wo => 
          wo.title.toLowerCase().includes(query.toLowerCase()) ||
          wo.description?.toLowerCase().includes(query.toLowerCase())
        )
        .map(wo => ({
          id: wo.id,
          type: 'workOrder' as const,
          title: wo.title,
          subtitle: wo.projectName || 'Proje bilgisi yok',
          status: wo.status,
          url: `/work-orders/${wo.id}`,
          icon: <FileText className="w-4 h-4" />
        }))

      // Sevkiyatlarda arama
      const shipments = await shipmentService.getAllShipments()
      const shipmentResults = shipments
        .filter(shipment => 
          shipment.number.toLowerCase().includes(query.toLowerCase()) ||
          shipment.destination.toLowerCase().includes(query.toLowerCase())
        )
        .map(shipment => ({
          id: shipment.id,
          type: 'shipment' as const,
          title: shipment.number,
          subtitle: shipment.destination,
          status: shipment.status,
          url: `/shipments/${shipment.id}`,
          icon: <Truck className="w-4 h-4" />
        }))

      searchResults.push(
        ...projectResults.slice(0, 3),
        ...spoolResults.slice(0, 3),
        ...personnelResults.slice(0, 3),
        ...workOrderResults.slice(0, 3),
        ...shipmentResults.slice(0, 3)
      )

      setResults(searchResults)
      setSelectedIndex(-1)
    } catch (error) {
      console.error('Arama hatası:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleResultClick(results[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setQuery('')
    }
  }

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url)
    setIsOpen(false)
    setQuery('')
    setResults([])
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'active':
        return 'Aktif'
      case 'completed':
        return 'Tamamlandı'
      case 'pending':
        return 'Beklemede'
      case 'cancelled':
        return 'İptal'
      case 'delivered':
        return 'Teslim Edildi'
      case 'in_transit':
        return 'Yolda'
      default:
        return status
    }
  }

  return (
    <div ref={searchRef} className="relative flex-1 max-w-lg">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Proje, spool, personel ara..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              setIsOpen(false)
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2">Aranıyor...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>Sonuç bulunamadı</p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    index === selectedIndex ? 'bg-gray-50 dark:bg-gray-700' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-gray-400">
                      {result.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {result.title}
                        </p>
                        {result.status && (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(result.status)}`}>
                            {getStatusText(result.status)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {result.subtitle}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 