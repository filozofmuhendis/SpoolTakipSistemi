'use client'

import { useState, useEffect } from 'react'
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import Link from 'next/link';
import { BarChart3, Users, Package, TrendingUp, AlertCircle, Clock, Bell, Filter } from 'lucide-react';
import { projectService } from '@/lib/services/projects';
import { spoolService } from '@/lib/services/spools';
import { personnelService } from '@/lib/services/personnel';
import { workOrderService } from '@/lib/services/workOrders';
import { shipmentService } from '@/lib/services/shipments';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalSpools: number;
  pendingShipments: number;
  newProjects: number;
}

interface Activity {
  id: string;
  type: 'spool_completed' | 'project_created' | 'shipment_started' | 'personnel_added' | 'work_order_created';
  title: string;
  description: string;
  timestamp: string;
  color: string;
}

interface ProjectStatus {
  id: string;
  name: string;
  spoolCount: number;
  progress: number;
  status: string;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalSpools: 0,
    pendingShipments: 0,
    newProjects: 0
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [projectStatuses, setProjectStatuses] = useState<ProjectStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Paralel olarak tüm verileri çek
      const [projects, spools, personnel, workOrders, shipments] = await Promise.all([
        projectService.getAllProjects(),
        spoolService.getAllSpools(),
        personnelService.getAllPersonnel(),
        workOrderService.getAllWorkOrders(),
        shipmentService.getAllShipments()
      ]);

      // İstatistikleri hesapla
      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => p.status === 'active').length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;
      const totalSpools = spools.length;
      const pendingShipments = shipments.filter(s => s.status === 'pending').length;
      
      // Son 30 günde oluşturulan projeler
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newProjects = projects.filter(p => new Date(p.createdAt) > thirtyDaysAgo).length;

      setStats({
        totalProjects,
        activeProjects,
        completedProjects,
        totalSpools,
        pendingShipments,
        newProjects
      });

      // Aktiviteleri oluştur
      const recentActivities = generateActivities(projects, spools, personnel, workOrders, shipments);
      setActivities(recentActivities);

      // Proje durumlarını oluştur
      const projectStatusList = generateProjectStatuses(projects, spools);
      setProjectStatuses(projectStatusList);

    } catch (error) {
      console.log('Dashboard verisi yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateActivities = (projects: any[], spools: any[], personnel: any[], workOrders: any[], shipments: any[]): Activity[] => {
    const activities: Activity[] = [];

    // Son tamamlanan spool'lar
    const recentCompletedSpools = spools
      .filter(spool => spool.status === 'completed')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 2);

    recentCompletedSpools.forEach(spool => {
      activities.push({
        id: `spool-${spool.id}`,
        type: 'spool_completed',
        title: `Spool ${spool.name} tamamlandı`,
        description: `${spool.projectName} projesinde`,
        timestamp: formatTimeAgo(new Date(spool.updatedAt)),
        color: 'text-blue-500'
      });
    });

    // Son oluşturulan projeler
    const recentProjects = projects
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 1);

    recentProjects.forEach(project => {
      activities.push({
        id: `project-${project.id}`,
        type: 'project_created',
        title: `Yeni proje oluşturuldu: ${project.name}`,
        description: `${project.managerName} tarafından`,
        timestamp: formatTimeAgo(new Date(project.createdAt)),
        color: 'text-green-500'
      });
    });

    // Son sevkiyatlar
    const recentShipments = shipments
      .filter(shipment => shipment.status === 'in_transit')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 1);

    recentShipments.forEach(shipment => {
      activities.push({
        id: `shipment-${shipment.id}`,
        type: 'shipment_started',
        title: `Sevkiyat ${shipment.number} yola çıktı`,
        description: `${shipment.destination} hedefine`,
        timestamp: formatTimeAgo(new Date(shipment.updatedAt)),
        color: 'text-yellow-500'
      });
    });

    // Son personel kayıtları
    const recentPersonnel = personnel
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 1);

    recentPersonnel.forEach(person => {
      activities.push({
        id: `personnel-${person.id}`,
        type: 'personnel_added',
        title: `Personel kaydı: ${person.name}`,
        description: `${person.position} pozisyonunda`,
        timestamp: formatTimeAgo(new Date(person.createdAt)),
        color: 'text-purple-500'
      });
    });

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 4);
  };

  const generateProjectStatuses = (projects: any[], spools: any[]): ProjectStatus[] => {
    return projects
      .map(project => {
        const projectSpools = spools.filter(spool => spool.projectId === project.id);
        const completedSpools = projectSpools.filter(spool => spool.status === 'completed').length;
        const progress = projectSpools.length > 0 ? Math.round((completedSpools / projectSpools.length) * 100) : 0;

        return {
          id: project.id,
          name: project.name,
          spoolCount: projectSpools.length,
          progress,
          status: project.status
        };
      })
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 3);
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} gün önce`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} hafta önce`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

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
            value={stats.totalProjects.toString()}
            trend=""
            icon="📊"
            description="Tüm projeler"
            color="blue"
          />
          <StatCard 
            title="Devam Eden"
            value={stats.activeProjects.toString()}
            trend=""
            icon="🏗"
            description="Aktif projeler"
            color="yellow"
          />
          <StatCard 
            title="Tamamlanan"
            value={stats.completedProjects.toString()}
            trend=""
            icon="✅"
            description="Tamamlanan projeler"
            color="green"
          />
          <StatCard 
            title="Toplam Spool"
            value={stats.totalSpools.toString()}
            trend=""
            icon="🔧"
            description="Tüm projelerde"
            color="purple"
          />
          <StatCard 
            title="Bekleyen Sevkiyat"
            value={stats.pendingShipments.toString()}
            trend=""
            icon="⏳"
            description="Hazır ürünler"
            color="orange"
          />
          <StatCard 
            title="Yeni Projeler"
            value={stats.newProjects.toString()}
            trend=""
            icon="📈"
            description="Son 30 günde"
            color="indigo"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Son İşlemler</h2>
            <ActivityList activities={activities} />
          </div>

          {/* Notifications Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Bildirimler</h2>
                <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                  {activities.length} yeni
                </span>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {activities.slice(0, 3).map((activity, index) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <span className={`w-2 h-2 mt-2 rounded-full ${activity.color.replace('text-', 'bg-')}`}></span>
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
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
                href="/shipments/new"
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
            <ProjectStatusList projects={projectStatuses} />
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

function ActivityList({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Henüz aktivite bulunmuyor</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
          <span className={activity.color}>●</span>
          <div>
            <p className="font-medium">{activity.title}</p>
            <p className="text-sm text-gray-500">{activity.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectStatusList({ projects }: { projects: ProjectStatus[] }) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Henüz proje bulunmuyor</p>
      </div>
    );
  }

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'text-green-500';
    if (progress >= 75) return 'text-blue-500';
    if (progress >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <div key={project.id} className="flex justify-between items-center p-2">
          <div>
            <p className="font-medium">{project.name}</p>
            <p className="text-sm text-gray-500">{project.spoolCount} Spool</p>
          </div>
          <span className={getProgressColor(project.progress)}>{project.progress}%</span>
        </div>
      ))}
    </div>
  );
}
