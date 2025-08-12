/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory artık varsayılan olduğu için experimental.appDir kaldırıldı
  eslint: {
    // Production build sırasında ESLint hatalarını ignore et
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Production build sırasında TypeScript hatalarını ignore et
    ignoreBuildErrors: false,
  },
  images: {
    domains: ['seipdlnyhkbhzddrfnaf.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'seipdlnyhkbhzddrfnaf.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Vercel için optimize edilmiş ayarlar
  poweredByHeader: false,
  compress: true,
  // API routes için timeout ayarı
  serverRuntimeConfig: {
    maxDuration: 30,
  },
}

module.exports = nextConfig