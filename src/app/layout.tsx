import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ToastProvider } from "@/components/ui/ToastProvider";

import ConditionalNavbar from "@/components/layout/ConditionalNavbar";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { initMockFetch } from "@/lib/mockFetch";

if (typeof window !== 'undefined') {
  initMockFetch();
}

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AtölyeAkış",
  description: "Modern üretim takip sistemi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <QueryProvider>
            <SessionProvider>
              <ToastProvider>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                  <ConditionalNavbar />
                  <main>
                    {children}
                  </main>
                </div>
              </ToastProvider>
            </SessionProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
