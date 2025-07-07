'use client'

import { ReactNode } from 'react'
import { ToastProvider } from '@/components/ui/ToastProvider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  )
}
