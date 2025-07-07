import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ToastProvider } from "@/components/ui/ToastProvider";
import Navbar from "@/components/layout/Navbar";
import ConditionalNavbar from "@/components/layout/ConditionalNavbar";

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
      </body>
    </html>
  )
}
