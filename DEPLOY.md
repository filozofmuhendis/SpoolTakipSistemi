# Vercel Deploy Rehberi

## Ön Gereksinimler

1. **Vercel Hesabı**: [vercel.com](https://vercel.com) üzerinden hesap oluşturun
2. **GitHub Repository**: Projenizi GitHub'a push edin
3. **Environment Variables**: Aşağıdaki değişkenleri hazırlayın

## Environment Variables

Vercel dashboard'unda aşağıdaki environment variable'ları ekleyin:

```
NEXT_PUBLIC_SUPABASE_URL=https://seipdlnyhkbhzddrfnaf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlaXBkbG55aGtiaHpkZHJmbmFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NDk5MDcsImV4cCI6MjA3MDUyNTkwN30.6Pd5zAwrmFz6d54bPDitNCxAKoIomGA9FIge_c3yaMU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlaXBkbG55aGtiaHpkZHJmbmFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk0OTkwNywiZXhwIjoyMDcwNTI1OTA3fQ.3Z87CRiEc894FCX0EAX86VRgdbaimhX5W61bD6Z4q9M
NEXTAUTH_SECRET=your_nextauth_secret_here_generate_a_strong_random_string
NEXTAUTH_URL=https://your-app-name.vercel.app
```

## Deploy Adımları

### Yöntem 1: GitHub Integration (Önerilen)

1. Projeyi GitHub'a push edin
2. [Vercel Dashboard](https://vercel.com/dashboard)'a gidin
3. "New Project" butonuna tıklayın
4. GitHub repository'nizi seçin
5. Environment variables'ları ekleyin
6. "Deploy" butonuna tıklayın

### Yöntem 2: Vercel CLI

```bash
# Vercel CLI ile login
vercel login

# Deploy
vercel

# Production deploy
vercel --prod
```

## Deploy Sonrası Kontroller

1. **Database Bağlantısı**: Supabase bağlantısının çalıştığını kontrol edin
2. **Authentication**: Login/logout işlemlerini test edin
3. **API Routes**: Tüm API endpoint'lerinin çalıştığını kontrol edin
4. **File Upload**: Dosya yükleme işlemlerini test edin

## Sorun Giderme

### Build Hataları
- ESLint hatalarını kontrol edin
- TypeScript hatalarını düzeltin
- Missing dependencies'leri ekleyin

### Runtime Hataları
- Environment variables'ların doğru ayarlandığını kontrol edin
- Supabase URL ve key'lerin geçerli olduğunu kontrol edin
- CORS ayarlarını kontrol edin

### Performance
- Image optimization ayarlarını kontrol edin
- Bundle size'ı optimize edin
- Caching stratejilerini gözden geçirin

## Güvenlik Notları

1. **NEXTAUTH_SECRET**: Güçlü bir random string kullanın
2. **Environment Variables**: Hassas bilgileri asla kodda hardcode etmeyin
3. **CORS**: Sadece gerekli domain'lere izin verin
4. **Rate Limiting**: API endpoint'lerinizi koruyun

## Monitoring

- Vercel Analytics'i aktif edin
- Error tracking için Sentry entegrasyonu yapın
- Performance monitoring ekleyin