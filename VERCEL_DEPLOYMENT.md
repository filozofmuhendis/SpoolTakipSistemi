# Vercel Deployment Rehberi

## Ön Gereksinimler

✅ **Hazır Olan:**
- Next.js 15.3.4 uygulaması
- Supabase veritabanı bağlantısı
- TypeScript konfigürasyonu
- Tailwind CSS styling
- API routes

## Deployment Adımları

### 1. Vercel Hesabı ve Proje Kurulumu

1. [Vercel.com](https://vercel.com) hesabı oluşturun
2. GitHub repository'nizi Vercel'e bağlayın
3. "Import Project" ile projeyi içe aktarın

### 2. Environment Variables Ayarları

Vercel Dashboard'da aşağıdaki environment variables'ları ekleyin:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://sinxmcbllwomcizcxhxt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpbnhtY2JsbHdvbWNpemN4aHh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjI1NTIsImV4cCI6MjA2Nzk5ODU1Mn0.i0_2kmXrFrEGsSFb0oOIsq9T7oOpnhVJ9Zb9-PCxc9U

# NextAuth Configuration
NEXTAUTH_SECRET=your_production_secret_here_32_chars_min
NEXTAUTH_URL=https://your-app-name.vercel.app
```

### 3. Supabase Konfigürasyonu

#### 3.1 Database Schema Kurulumu

1. Supabase Dashboard > SQL Editor'a gidin
2. `fix-auth-schema.sql` dosyasını çalıştırın:

```sql
-- Bu dosyayı Supabase SQL Editor'da çalıştırın
-- Profiles tablosu ve auth triggers'ları oluşturur
```

#### 3.2 RLS (Row Level Security) Politikaları

- Profiles tablosu için RLS etkinleştirildi
- Kullanıcılar sadece kendi profillerini görebilir/düzenleyebilir
- Admin kullanıcıları tüm verilere erişebilir

### 4. Build Konfigürasyonu

#### 4.1 Next.js Konfigürasyonu

`next.config.js` dosyası minimal ve production-ready:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory artık varsayılan olduğu için experimental.appDir kaldırıldı
}

module.exports = nextConfig
```

#### 4.2 Vercel Konfigürasyonu

`vercel.json` dosyası oluşturuldu:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 5. Deployment Checklist

#### ✅ Hazır Olanlar:
- [x] TypeScript konfigürasyonu
- [x] ESLint konfigürasyonu
- [x] Tailwind CSS
- [x] API routes
- [x] Supabase bağlantısı
- [x] Authentication sistemi
- [x] Database schema
- [x] Environment variables
- [x] Vercel konfigürasyonu

#### ⚠️ Dikkat Edilmesi Gerekenler:

1. **NEXTAUTH_SECRET**: Production için güçlü bir secret oluşturun
2. **NEXTAUTH_URL**: Vercel domain'inizi güncelleyin
3. **Supabase RLS**: Güvenlik politikalarını kontrol edin
4. **API Rate Limiting**: Gerekirse rate limiting ekleyin

### 6. Deployment Sonrası Testler

1. **Authentication Test**: `/login` sayfasını test edin
2. **Database Connection**: `/test-supabase` sayfasını kontrol edin
3. **API Endpoints**: Tüm API route'larını test edin
4. **File Upload**: Dosya yükleme işlevini test edin

### 7. Domain ve SSL

- Vercel otomatik SSL sertifikası sağlar
- Custom domain eklemek için Vercel Dashboard kullanın
- DNS ayarlarını Vercel'in talimatlarına göre yapın

### 8. Monitoring ve Analytics

- Vercel Analytics otomatik olarak etkinleştirilir
- Error tracking için Sentry entegrasyonu önerilir
- Performance monitoring için Vercel Speed Insights kullanın

## Troubleshooting

### Build Hataları

1. **TypeScript Errors**: `npm run type-check` ile kontrol edin
2. **ESLint Errors**: `npm run lint` ile düzeltin
3. **Environment Variables**: Vercel Dashboard'da kontrol edin

### Runtime Hataları

1. **Supabase Connection**: Environment variables'ları kontrol edin
2. **Authentication**: NEXTAUTH_URL ve NEXTAUTH_SECRET'i kontrol edin
3. **API Errors**: Vercel Functions logs'unu inceleyin

## Sonuç

🎉 **Uygulama Vercel'e deploy edilmeye hazır!**

Tüm gerekli konfigürasyonlar tamamlandı. Sadece:
1. GitHub'a push yapın
2. Vercel'de environment variables'ları ayarlayın
3. Deploy butonuna basın

**Test URL**: `https://your-app-name.vercel.app/test-supabase`