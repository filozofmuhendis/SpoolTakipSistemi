import { ThemeToggle } from "@/components/ui/ThemeToggle";
import Link from 'next/link';
import { BarChart3, Users, Package, TrendingUp, AlertCircle, Clock, Bell, Filter } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <div className="p-6 w-full max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Yönetici Paneli</h1>
          <div className="flex gap-4 items-center">
            <Link href="/projects" className="btn-primary flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Projeler
            </Link>
            <Link href="/work-orders" className="btn-primary flex items-center gap-2">
              <Package className="w-4 h-4" />
              İş Emirleri
            </Link>
            <Link href="/personnel" className="btn-primary flex items-center gap-2">
              <Users className="w-4 h-4" />
              Personel
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* Quick Stats / KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatCard 
            title="Toplam Proje"
            value="48"
            trend="+3"
            icon="📊"
            description="Son 30 günde"
            color="blue"
          />
          <StatCard 
            title="Devam Eden"
            value="12"
            trend="+2"
            icon="🏗"
            description="Aktif projeler"
            color="yellow"
          />
          <StatCard 
            title="Tamamlanan"
            value="36"
            trend="+5"
            icon="✅"
            description="Toplam proje"
            color="green"
          />
          <StatCard 
            title="Toplam Spool"
            value="1,248"
            trend="+156"
            icon="🔧"
            description="Tüm projelerde"
            color="purple"
          />
          <StatCard 
            title="Bekleyen Sevkiyat"
            value="86"
            trend="-12"
            icon="⏳"
            description="Hazır ürünler"
            color="orange"
          />
          <StatCard 
            title="Yeni Projeler"
            value="8"
            trend="+2"
            icon="📈"
            description="Bu ay açılan"
            color="indigo"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Son İşlemler</h2>
            <ActivityList />
          </div>

          {/* Notifications Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Bildirimler</h2>
                <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">4 yeni</span>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { type: 'urgent', title: 'Gecikme Uyarısı', message: 'SP-156 termini yaklaşıyor', time: '5 dk önce' },
                { type: 'warning', title: 'Malzeme Talebi', message: 'Yeni malzeme siparişi onay bekliyor', time: '30 dk önce' },
                { type: 'info', title: 'Yeni İş Emri', message: 'PRJ-789 için yeni iş emri oluşturuldu', time: '1 saat önce' },
              ].map((notification, index) => (
                <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <span className={`w-2 h-2 mt-2 rounded-full ${
                    notification.type === 'urgent' ? 'bg-red-500' :
                    notification.type === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}></span>
                  <div>
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-center text-sm text-blue-500 hover:text-blue-600">
              Tüm Bildirimleri Gör
            </button>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Hızlı İşlemler</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              <QuickActionCard 
                title="Yeni Proje"
                icon="📁"
                href="/projects/new"
              />
              <QuickActionCard 
                title="İş Emri Oluştur"
                icon="📝"
                href="/work-orders/new"
              />
              <QuickActionCard 
                title="Personel Kayıt"
                icon="👥"
                href="/personnel/new"
              />
              <QuickActionCard 
                title="Sevkiyatlar"
                icon="🚚"
                href="/shipments"
              />
              <QuickActionCard 
                title="Malzeme Girişi"
                icon="🔄"
                href="/inventory/new"
              />
            </div>
          </div>

          {/* Project Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Proje Durumları</h2>
            <ProjectStatusList />
          </div>
        </div>
      </div>
    </main>
  );
}

interface QuickAccessCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
}

function QuickAccessCard({ title, description, icon, href }: QuickAccessCardProps) {
  return (
    <a 
      href={href}
      className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow
                 bg-white dark:bg-gray-800 cursor-pointer"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </a>
  );
}

// Update StatCard interface and component
interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  icon: string;
  description: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange' | 'indigo';
}

function StatCard({ title, value, trend, icon, description, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    green: 'bg-green-50 dark:bg-green-900/20',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20',
    red: 'bg-red-50 dark:bg-red-900/20',
    purple: 'bg-purple-50 dark:bg-purple-900/20',
    orange: 'bg-orange-50 dark:bg-orange-900/20',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20'
  };

  return (
    <div className={`rounded-lg p-4 shadow-sm ${colorClasses[color]} transition-all hover:scale-[1.02]`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <p className="text-gray-700 dark:text-gray-300 font-medium">{title}</p>
          </div>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
        </div>
      </div>
      <div className="mt-2 space-y-1">
        <p className={`text-sm ${trend.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {trend} değişim
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  title: string;
  icon: string;
  href: string;
}

function QuickActionCard({ title, icon, href }: QuickActionCardProps) {
  return (
    <a href={href} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors">
      <span className="text-2xl block mb-2">{icon}</span>
      <span className="font-medium">{title}</span>
    </a>
  );
}

function ActivityList() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
        <span className="text-blue-500">●</span>
        <div>
          <p className="font-medium">Spool #234 tamamlandı</p>
          <p className="text-sm text-gray-500">2 saat önce</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
        <span className="text-green-500">●</span>
        <div>
          <p className="font-medium">Yeni proje oluşturuldu: Istanbul Projesi</p>
          <p className="text-sm text-gray-500">4 saat önce</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
        <span className="text-yellow-500">●</span>
        <div>
          <p className="font-medium">Sevkiyat #SH-2024-001 yola çıktı</p>
          <p className="text-sm text-gray-500">6 saat önce</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
        <span className="text-purple-500">●</span>
        <div>
          <p className="font-medium">Personel kaydı: Fatma Özkan</p>
          <p className="text-sm text-gray-500">1 gün önce</p>
        </div>
      </div>
    </div>
  );
}

function ProjectStatusList() {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center p-2">
        <div>
          <p className="font-medium">Galata Projesi</p>
          <p className="text-sm text-gray-500">34 Spool</p>
        </div>
        <span className="text-green-500">75%</span>
      </div>
      <div className="flex justify-between items-center p-2">
        <div>
          <p className="font-medium">Bosphorus Projesi</p>
          <p className="text-sm text-gray-500">28 Spool</p>
        </div>
        <span className="text-blue-500">100%</span>
      </div>
      <div className="flex justify-between items-center p-2">
        <div>
          <p className="font-medium">Istanbul Projesi</p>
          <p className="text-sm text-gray-500">42 Spool</p>
        </div>
        <span className="text-yellow-500">0%</span>
      </div>
    </div>
  );
}
