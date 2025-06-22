'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Package, Users, BarChart3, Settings, LogOut, User } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo ve Ana Menü */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                AtölyeAkış
              </span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="/projects" 
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                Projeler
              </Link>
              <Link 
                href="/work-orders" 
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                İş Emirleri
              </Link>
              <Link 
                href="/personnel" 
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                Personel
              </Link>
              <Link 
                href="/shipments" 
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sevkiyatlar
              </Link>
              <Link 
                href="/reports" 
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                Raporlar
              </Link>
            </div>
          </div>

          {/* Sağ Taraf - Kullanıcı Menüsü */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            <div className="relative">
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">{session?.user?.name}</span>
                  <span className="text-gray-500 ml-1">({session?.user?.role})</span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-md"
                  title="Çıkış Yap"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}