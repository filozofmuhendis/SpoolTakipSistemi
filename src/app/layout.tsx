import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Navbar } from "@/components/layout/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AtölyeAkış",
  description: "Üretim takip sistemimizi kullanarak üretilen ürünlerinizi takip edin.",
};

import { Providers } from './providers'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SessionProvider session={session}>
          <Providers>
            {/* Navbar sadece oturum açıldığında gösterilecek */}
            {session?.user && <Navbar />}
            <main className="min-h-screen bg-gray-50">
              {children}
            </main>
          </Providers>
        </SessionProvider>
      </body>
    </html>
  )
}
