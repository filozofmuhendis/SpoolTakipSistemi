# Spool Takip Sistemi

Bu proje, endüstriyel spool üretim süreçlerini takip etmek için geliştirilmiş kapsamlı bir yönetim sistemidir. Next.js, TypeScript, Tailwind CSS ve Supabase kullanılarak modern web teknolojileri ile geliştirilmiştir.

## 🚀 Özellikler

### 📊 Proje Yönetimi
- Proje oluşturma ve takibi
- Proje durumu yönetimi (aktif, tamamlanmış, iptal edilmiş)
- Proje bütçesi ve zaman takibi
- Müşteri bilgileri yönetimi

### 🔧 Spool Yönetimi
- Spool oluşturma ve takibi
- Spool durumu yönetimi (beklemede, aktif, tamamlanmış)
- Spool atama ve sorumluluk takibi
- Malzeme türü ve özellik tanımları
- Boyut ve ağırlık bilgileri

### 👥 Personel Yönetimi
- Personel kayıt ve profil yönetimi
- Departman ve pozisyon takibi
- Personel durumu yönetimi
- Acil durum iletişim bilgileri
- Beceri ve yetkinlik takibi

### 📋 İş Emirleri
- İş emri oluşturma ve takibi
- Öncelik seviyesi yönetimi
- Tahmini ve gerçek süre takibi
- Malzeme kullanım kayıtları
- Kalite kontrol entegrasyonu

### 🚚 Sevkiyat Yönetimi
- Sevkiyat planlama ve takibi
- Kargo firması entegrasyonu
- Takip numarası yönetimi
- Sigorta ve gümrük bilgileri
- Özel talimatlar

### 📦 Envanter Yönetimi
- Malzeme ve ürün takibi
- Stok seviyesi kontrolü
- Minimum/maksimum stok uyarıları
- Tedarikçi yönetimi
- Maliyet takibi
- Envanter hareketleri (giriş/çıkış/düzeltme)

### 🔍 Kalite Kontrol
- Kalite kontrol süreçleri
- Müfettiş atama
- Hata tespiti ve düzeltme aksiyonları
- Sonraki kontrol tarihi planlaması
- Kalite istatistikleri

### 📝 Malzeme Talepleri
- Malzeme talep sistemi
- Onay süreçleri
- Talep durumu takibi
- Talep kalemleri yönetimi
- Tedarik süreçleri

### ⏰ Çalışma Saatleri
- Personel çalışma saati takibi
- Proje bazlı saat kayıtları
- Fazla mesai takibi
- Onay süreçleri

### 🔧 Ekipman Yönetimi
- Ekipman kayıt ve takibi
- Bakım planlaması
- Garanti takibi
- Ekipman atama

### 📊 Raporlama ve Analitik
- Dashboard istatistikleri
- Proje performans raporları
- Personel iş yükü analizi
- Envanter raporları
- Kalite kontrol istatistikleri

### 🔔 Bildirim Sistemi
- Gerçek zamanlı bildirimler
- E-posta ve push bildirimleri
- Özelleştirilebilir bildirim tercihleri
- Düşük stok uyarıları

### 📁 Dosya Yönetimi
- Dosya yükleme ve saklama
- Proje bazlı dosya organizasyonu
- Güvenli dosya erişimi
- Çoklu dosya formatı desteği

### 🔒 Güvenlik ve Audit
- Kullanıcı yetkilendirme sistemi
- Rol tabanlı erişim kontrolü
- Audit log sistemi
- Veri değişiklik takibi

## 🛠️ Teknolojiler

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime
- **UI Components**: Headless UI, Lucide React
- **Forms**: React Hook Form, Zod validation
- **Charts**: Recharts (opsiyonel)

## 📋 Veritabanı Yapısı

### Ana Tablolar
- `profiles` - Kullanıcı profilleri
- `projects` - Proje bilgileri
- `personnel` - Personel kayıtları
- `spools` - Spool takibi
- `work_orders` - İş emirleri
- `shipments` - Sevkiyat takibi
- `inventory` - Envanter yönetimi
- `inventory_transactions` - Envanter hareketleri
- `quality_checks` - Kalite kontrol
- `material_requests` - Malzeme talepleri
- `work_hours` - Çalışma saatleri
- `equipment` - Ekipman yönetimi

### Destek Tabloları
- `file_uploads` - Dosya yüklemeleri
- `notifications` - Bildirimler
- `notification_preferences` - Bildirim tercihleri
- `audit_logs` - Audit kayıtları
- `reports` - Raporlar

### Görünümler (Views)
- `spool_progress` - Spool ilerleme durumu
- `inventory_summary` - Envanter özeti
- `work_order_summary` - İş emri özeti
- `personnel_workload` - Personel iş yükü

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Supabase hesabı

### Adımlar

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
- [Supabase Dashboard](https://supabase.com/dashboard) adresine gidin
- Yeni proje oluşturun
- Proje URL'si ve API anahtarını alın

4. **Çevre değişkenlerini ayarlayın**
```bash
cp .env.example .env.local
```

`.env.local` dosyasını düzenleyin:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

5. **Veritabanı şemasını oluşturun**
- Supabase Dashboard'da SQL Editor'ü açın
- `supabase-schema-complete.sql` dosyasının içeriğini kopyalayın ve çalıştırın

6. **Uygulamayı başlatın**
```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## 📊 Veritabanı Şeması

Proje, kapsamlı bir Supabase veritabanı şeması kullanır:

### Güvenlik Özellikleri
- Row Level Security (RLS) politikaları
- Kullanıcı yetkilendirme sistemi
- Audit log sistemi
- Güvenli dosya yükleme

### Performans Optimizasyonları
- İndeksler ve görünümler
- Otomatik timestamp güncellemeleri
- Verimli sorgu yapıları

### Otomatik İşlemler
- Yeni kullanıcı kayıt işlemleri
- Envanter stok güncellemeleri
- Düşük stok uyarıları
- Audit log kayıtları

## 🔧 Geliştirme

### Proje Yapısı
```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── (auth)/         # Auth pages
│   ├── admin/          # Admin pages
│   ├── inventory/      # Inventory pages
│   ├── personnel/      # Personnel pages
│   ├── projects/       # Project pages
│   ├── shipments/      # Shipment pages
│   ├── spools/         # Spool pages
│   └── work-orders/    # Work order pages
├── components/         # React components
├── hooks/             # Custom hooks
├── lib/               # Utilities and services
│   ├── services/      # API services
│   ├── supabase.ts    # Supabase client
│   └── auth.ts        # Auth configuration
└── types/             # TypeScript types
```

### Servis Katmanı
Proje, her modül için ayrı servis dosyaları kullanır:
- `inventoryService` - Envanter işlemleri
- `personnelService` - Personel yönetimi
- `projectService` - Proje yönetimi
- `spoolService` - Spool takibi
- `workOrderService` - İş emirleri
- `shipmentService` - Sevkiyat yönetimi
- `qualityCheckService` - Kalite kontrol
- `materialRequestService` - Malzeme talepleri

## 📱 Kullanım

### Kullanıcı Rolleri
- **Admin**: Tüm sistem yönetimi
- **Manager**: Proje ve personel yönetimi
- **User**: Temel işlemler

### Ana İş Akışları
1. **Proje Oluşturma** → Spool Tanımlama → İş Emri Oluşturma
2. **Malzeme Talebi** → Onay Süreci → Envanter Güncelleme
3. **Kalite Kontrol** → Hata Tespiti → Düzeltme Aksiyonları
4. **Sevkiyat Planlama** → Kargo Takibi → Teslimat

## 🔒 Güvenlik

- Supabase RLS politikaları ile veri güvenliği
- JWT tabanlı kimlik doğrulama
- Rol tabanlı erişim kontrolü
- Audit log sistemi ile değişiklik takibi

## 📈 Performans

- Supabase'in optimize edilmiş PostgreSQL altyapısı
- İndeksler ve görünümler ile hızlı sorgular
- CDN ile statik dosya dağıtımı
- Real-time güncellemeler

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Proje hakkında sorularınız için issue açabilir veya iletişime geçebilirsiniz.

---

**Spool Takip Sistemi** - Endüstriyel üretim süreçlerinizi dijitalleştirin! 🏭
