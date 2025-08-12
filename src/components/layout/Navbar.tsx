'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, User, LogOut, Settings, Bell, Home, BarChart3, Package, Users, FileText, Truck, Box, TrendingUp } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

import GlobalSearch from '@/components/ui/GlobalSearch'
import { signOut } from 'next-auth/react'

export default function Navbar() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, color: 'from-blue-500 to-cyan-500' },
    { name: 'Projeler', href: '/projects', icon: BarChart3, color: 'from-emerald-500 to-teal-500' },
    { name: 'Ürün Alt Kalemleri', href: '/spools', icon: Package, color: 'from-purple-500 to-pink-500' },
    { name: 'Personel', href: '/personnel', icon: Users, color: 'from-orange-500 to-red-500' },
    { name: 'İş Emirleri', href: '/work-orders', icon: FileText, color: 'from-indigo-500 to-purple-500' },
    { name: 'Sevkiyat', href: '/shipments', icon: Truck, color: 'from-pink-500 to-rose-500' },
    { name: 'Envanter', href: '/inventory', icon: Box, color: 'from-yellow-500 to-orange-500' },
    { name: 'Raporlar', href: '/reports', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
  ]

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
    setIsProfileOpen(false)
  }

  return (
    <nav className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-xl border-b border-white/20 dark:border-gray-700/50">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 dark:from-blue-400/5 dark:via-purple-400/5 dark:to-pink-400/5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-white/50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700/50 transition-all duration-200 backdrop-blur-sm"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">
                AtölyeAkış
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:ml-8 lg:flex lg:space-x-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const IconComponent = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? 'text-white shadow-lg'
                        : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:scale-105'
                    }`}
                  >
                    {/* Active Background */}
                    {isActive && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-xl shadow-lg`}></div>
                    )}
                    
                    {/* Hover Background */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-white/50 dark:bg-gray-700/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"></div>
                    )}
                    
                    {/* Content */}
                    <div className="relative flex items-center space-x-2">
                      <IconComponent className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right side - Search, Notifications, Profile */}
          <div className="flex items-center space-x-4">

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="group flex items-center space-x-3 p-2 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-white/50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700/50 transition-all duration-300 backdrop-blur-sm"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-semibold">
                    {user?.email?.split('@')[0] || 'Kullanıcı'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Çevrimiçi
                  </div>
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 z-50">
                  <div className="p-2">
                    <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {user?.email?.split('@')[0] || 'Kullanıcı'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Link
                        href="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="group flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white/50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 backdrop-blur-sm"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        Profil
                      </Link>
                      
                      <Link
                        href="/notifications"
                        onClick={() => setIsProfileOpen(false)}
                        className="group flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white/50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 backdrop-blur-sm"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                          <Bell className="w-4 h-4 text-white" />
                        </div>
                        Bildirimler
                      </Link>
                      
                      <Link
                        href="/notifications/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="group flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white/50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 backdrop-blur-sm"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                          <Settings className="w-4 h-4 text-white" />
                        </div>
                        Bildirim Ayarları
                      </Link>
                      
                      <div className="border-t border-gray-200/50 dark:border-gray-700/50 my-2"></div>
                      
                      <button
                        onClick={handleSignOut}
                        className="group flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                          <LogOut className="w-4 h-4 text-white" />
                        </div>
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-white/20 dark:border-gray-700/20 shadow-xl">
              <div className="px-4 pt-4 pb-3 space-y-2">
                {navigation.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`group flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400 shadow-lg backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white backdrop-blur-sm'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-all duration-200 ${
                        isActive 
                          ? `bg-gradient-to-r ${item.color} shadow-lg group-hover:scale-110`
                          : `bg-gray-100 dark:bg-gray-700 group-hover:scale-110 group-hover:bg-gradient-to-r group-hover:${item.color.split(' ').slice(1).join(' ')}`
                      }`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              <div className="px-4 pt-4 pb-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <GlobalSearch />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop for mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Backdrop for profile dropdown */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </nav>
  )
}
