'use client'

import { useState, useEffect } from 'react'
import { personnelService } from '@/lib/services/personnel'
import Loading from '@/components/ui/Loading'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPersonnel()
  }, [])

  const loadPersonnel = async () => {
    try {
      setLoading(true)
      setError(null)
      const personnelData = await personnelService.getAllPersonnel()
      setPersonnel(personnelData)
    } catch (error) {
      setError('Personel yüklenirken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading text="Personel yükleniyor..." />
  }

  if (error) {
    return <ErrorState title="Hata" description={error} />
  }

  if (personnel.length === 0) {
    return <EmptyState title="Personel bulunamadı" description="Kayıtlı personel yok." />
  }

  return (
    <div className="p-6 w-full max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Personel Listesi</h1>
      <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Ad</th>
            <th className="px-4 py-2 text-left">Rol</th>
            <th className="px-4 py-2 text-left">Email</th>
          </tr>
        </thead>
        <tbody>
          {personnel.map((person) => (
            <tr key={person.id} className="border-b">
              <td className="px-4 py-2">{person.name}</td>
              <td className="px-4 py-2">{person.role}</td>
              <td className="px-4 py-2">{person.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}