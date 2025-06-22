# Spool Takip Sistemi

Modern ve kullanıcı dostu bir üretim takip sistemi. Next.js, TypeScript, Tailwind CSS ve Supabase kullanılarak geliştirilmiştir.

## 🚀 Özellikler

- **Proje Yönetimi**: Projeleri oluşturma, düzenleme ve takip etme
- **Spool Takibi**: Üretim spool'larının durumunu ve ilerlemesini takip etme
- **İş Emirleri**: İş emirlerini yönetme ve atama
- **Personel Yönetimi**: Personel bilgilerini ve durumlarını takip etme
- **Sevkiyat Takibi**: Sevkiyat durumlarını ve detaylarını yönetme
- **Raporlama**: Detaylı raporlar ve analizler
- **Rol Tabanlı Erişim**: Admin, Manager ve User rolleri
- **Gerçek Zamanlı Veri**: Supabase ile gerçek zamanlı veri senkronizasyonu
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu arayüz
- **Dark/Light Tema**: Kullanıcı tercihine göre tema değiştirme

## 🛠️ Teknoloji Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Authentication**: NextAuth.js + Supabase Auth
- **UI Components**: Custom components with Tailwind CSS
- **State Management**: React hooks + Supabase subscriptions
- **Deployment**: Vercel (recommended)

## 📋 Gereksinimler

- Node.js 18+ 
- npm veya yarn
- Supabase hesabı

## 🚀 Kurulum

1. **Projeyi klonlayın**
```bash
git clone <repository-url>
cd SpoolTakipSistemi
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Supabase projesi oluşturun**
   - [Supabase](https://supabase.com) hesabı oluşturun
   - Yeni proje oluşturun
   - Proje URL'si ve anonim anahtarını alın

4. **Environment değişkenlerini ayarlayın**
`.env.local` dosyası oluşturun:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3002
```

5. **Veritabanı şemasını oluşturun**
   - Supabase Dashboard'da SQL Editor'ü açın
   - `supabase-schema.sql` dosyasının içeriğini kopyalayıp yapıştırın
   - Execute butonuna tıklayın

6. **Demo kullanıcıları oluşturun**
   Supabase Auth bölümünde aşağıdaki kullanıcıları oluşturun:
   - Email: `admin@example.com`, Password: `admin123`
   - Email: `manager@example.com`, Password: `manager123`
   - Email: `user@example.com`, Password: `user123`

7. **Uygulamayı başlatın**
```bash
npm run dev
```

Uygulama http://localhost:3002 adresinde çalışacaktır.

## 📊 Veritabanı Şeması

### Tablolar

- **profiles**: Kullanıcı profilleri ve rolleri
- **projects**: Proje bilgileri
- **spools**: Spool takip bilgileri
- **personnel**: Personel bilgileri
- **work_orders**: İş emirleri
- **shipments**: Sevkiyat bilgileri

### İlişkiler

- Projects ↔ Spools (1:N)
- Projects ↔ Work Orders (1:N)
- Projects ↔ Shipments (1:N)
- Profiles ↔ Projects (1:N) - Manager ilişkisi
- Personnel ↔ Work Orders (1:N) - Assignment ilişkisi

## 🔐 Güvenlik

- **Row Level Security (RLS)**: Tüm tablolarda aktif
- **Role-based Access Control**: Admin, Manager, User rolleri
- **Authentication**: Supabase Auth + NextAuth.js
- **API Security**: Supabase API anahtarları ile korumalı

## 📱 Kullanım

### Giriş
- Demo kullanıcıları ile giriş yapın
- Admin hesabı tüm özelliklere erişim sağlar

### Proje Yönetimi
- Projeleri görüntüleme, oluşturma, düzenleme
- Proje durumlarını takip etme
- Proje bazlı spool ve iş emirleri

### Spool Takibi
- Spool durumlarını güncelleme
- İlerleme takibi
- Atama işlemleri

### İş Emirleri
- İş emirlerini oluşturma ve atama
- Öncelik ve durum yönetimi
- Tarih takibi

### Personel Yönetimi
- Personel bilgilerini yönetme
- Departman bazlı filtreleme
- Durum takibi

### Sevkiyat Takibi
- Sevkiyat oluşturma ve takip
- Kargo bilgileri
- Durum güncellemeleri

## 🎨 UI/UX Özellikleri

- **Modern Tasarım**: Clean ve professional görünüm
- **Responsive**: Tüm cihazlarda uyumlu
- **Dark/Light Mode**: Kullanıcı tercihi
- **Loading States**: Kullanıcı deneyimi için loading animasyonları
- **Error Handling**: Kullanıcı dostu hata mesajları
- **Notifications**: Başarı ve hata bildirimleri

## 🔧 Geliştirme

### Proje Yapısı
```
src/
├── app/                 # Next.js App Router
├── components/          # React bileşenleri
├── lib/                 # Utility fonksiyonları
│   ├── services/        # Supabase servisleri
│   └── supabase.ts      # Supabase konfigürasyonu
├── types/               # TypeScript type tanımları
└── hooks/               # Custom React hooks
```

### Yeni Özellik Ekleme
1. TypeScript type tanımlarını `src/types/index.ts`'e ekleyin
2. Supabase servisini `src/lib/services/` altında oluşturun
3. UI bileşenlerini `src/components/` altında oluşturun
4. Sayfa bileşenlerini `src/app/` altında oluşturun

## 🚀 Deployment

### Vercel (Önerilen)
1. Vercel hesabı oluşturun
2. GitHub repository'nizi bağlayın
3. Environment değişkenlerini ayarlayın
4. Deploy edin

### Diğer Platformlar
- Netlify
- Railway
- Heroku

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add some amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 Destek

Herhangi bir sorun yaşarsanız:
- Issue oluşturun
- Email gönderin
- Dokümantasyonu kontrol edin

## 🔄 Güncellemeler

### v1.0.0
- İlk sürüm
- Temel CRUD işlemleri
- Supabase entegrasyonu
- Rol tabanlı erişim
- Responsive tasarım
