'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react'

export default function RateLimitPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(60)
  const [canRetry, setCanRetry] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanRetry(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleRetry = () => {
    router.back()
  }

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Çok Fazla İstek
            </h2>
            
            <p className="text-gray-600 mb-6">
              Güvenlik nedeniyle geçici olarak erişiminiz kısıtlanmıştır. 
              Lütfen bir süre bekleyip tekrar deneyin.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                <div className="text-sm text-yellow-800">
                  {canRetry ? (
                    <span className="font-medium">Artık tekrar deneyebilirsiniz</span>
                  ) : (
                    <span>
                      Tekrar deneme süresi: <span className="font-medium">{countdown} saniye</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                disabled={!canRetry}
                className={`w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  canRetry
                    ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    : 'bg-gray-400 cursor-not-allowed'
                } transition-colors duration-200`}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${!canRetry ? 'animate-spin' : ''}`} />
                {canRetry ? 'Tekrar Dene' : 'Bekliyor...'}
              </button>
              
              <button
                onClick={handleGoHome}
                className="w-full flex justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Ana Sayfaya Dön
              </button>
            </div>
            
            <div className="mt-6 text-xs text-gray-500">
              <p>Bu kısıtlama otomatik olarak kalkacaktır.</p>
              <p>Sorun devam ederse sistem yöneticisi ile iletişime geçin.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}