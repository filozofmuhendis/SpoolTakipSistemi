'use client'

import { useState, useEffect } from 'react'
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import Link from 'next/link';
import { BarChart3, Users, Package, TrendingUp, AlertCircle, Clock, Bell, Filter } from 'lucide-react';
import { projectService } from '@/lib/services/projects';
import { spoolService } from '@/lib/services/spools';
import { personnelService } from '@/lib/services/personnel';
import { jobOrderService } from '@/lib/services/workOrders';
import { shipmentService } from '@/lib/services/shipments';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalSpools: number;
  pendingShipments: number;
  totalPersonnel: number;
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
  status: string;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalSpools: 0,
    pendingShipments: 0,
    totalPersonnel: 0
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
        jobOrderService.getAllJobOrders(),
        shipmentService.getAllShipments()
      ]);

      // İstatistikleri hesapla
      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => p.status === 'active').length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;
      const totalSpools = spools.length;
      const pendingShipments = shipments.filter(s => s.status === 'pending').length;
      const totalPersonnel = personnel.length;

      setStats({
        totalProjects,
        activeProjects,
        completedProjects,
        totalSpools,
        pendingShipments,
        totalPersonnel
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
      .slice(0, 2);

    recentCompletedSpools.forEach(spool => {
      activities.push({
        id: `spool-${spool.id}`,
        type: 'spool_completed',
        title: `Spool ${spool.name} tamamlandı`,
        description: `Proje ID: ${spool.project_id}`,
        timestamp: 'Az önce',
        color: 'text-blue-500'
      });
    });

    // Son oluşturulan projeler
    const recentProjects = projects.slice(0, 1);

    recentProjects.forEach(project => {
      activities.push({
        id: `project-${project.id}`,
        type: 'project_created',
        title: `Yeni proje oluşturuldu: ${project.name}`,
        description: `Proje durumu: ${project.status}`,
        timestamp: 'Az önce',
        color: 'text-green-500'
      });
    });

    // Son sevkiyatlar
    const recentShipments = shipments
      .filter(shipment => shipment.status === 'in_transit')
      .slice(0, 1);

    recentShipments.forEach(shipment => {
      activities.push({
        id: `shipment-${shipment.id}`,
        type: 'shipment_started',
        title: `Sevkiyat #${shipment.id.slice(-6)} yola çıktı`,
        description: `Durum: ${shipment.status}`,
        timestamp: 'Az önce',
        color: 'text-yellow-500'
      });
    });

    // Son personel kayıtları
    const recentPersonnel = personnel.slice(0, 1);

    recentPersonnel.forEach(person => {
      activities.push({
        id: `personnel-${person.id}`,
        type: 'personnel_added',
        title: `Personel kaydı: ${person.name}`,
        description: `${person.position} pozisyonunda`,
        timestamp: 'Az önce',
        color: 'text-purple-500'
      });
    });

    return activities.slice(0, 4);
  };

  const generateProjectStatuses = (projects: any[], spools: any[]): ProjectStatus[] => {
    return projects
      .map(project => {
        const projectSpools = spools.filter(spool => spool.project_id === project.id);

        return {
          id: project.id,
          name: project.name,
          spoolCount: projectSpools.length,
          status: project.status
        };
      })
      .sort((a, b) => b.spoolCount - a.spoolCount)
      .slice(0, 3);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Spool Takip Sistemi
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Hoş geldiniz! Bugünkü özet bilgileriniz aşağıda.
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Toplam Projeler"
            value={stats.totalProjects.toString()}
            trend="+12%"
            icon="BarChart3"
            description="Bu ay"
            color="blue"
          />
          <StatCard
            title="Aktif Projeler"
            value={stats.activeProjects.toString()}
            trend="+5%"
            icon="TrendingUp"
            description="Devam eden"
            color="green"
          />
          <StatCard
            title="Toplam Spool"
            value={stats.totalSpools.toString()}
            trend="+8%"
            icon="Package"
            description="Tüm projelerde"
            color="purple"
          />
          <StatCard
            title="Bekleyen Sevkiyat"
            value={stats.pendingShipments.toString()}
            trend="-2%"
            icon="AlertCircle"
            description="Bu hafta"
            color="yellow"
          />
          <StatCard
            title="Tamamlanan Projeler"
            value={stats.completedProjects.toString()}
            trend="+15%"
            icon="Clock"
            description="Bu ay"
            color="green"
          />
          <StatCard
            title="Toplam Personel"
            value={stats.totalPersonnel.toString()}
            trend="+3%"
            icon="Users"
            description="Aktif"
            color="indigo"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hızlı Erişim */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Hızlı Erişim
              </h2>
              <div className="space-y-3">
                <QuickActionCard
                  title="Yeni Proje"
                  icon="Plus"
                  href="/projects/new"
                />
                <QuickActionCard
                  title="Yeni Spool"
                  icon="Package"
                  href="/spools/new"
                />
                <QuickActionCard
                  title="Yeni İş Emri"
                  icon="FileText"
                  href="/work-orders/new"
                />
                <QuickActionCard
                  title="Personel Ekle"
                  icon="Users"
                  href="/personnel/new"
                />
              </div>
            </div>
          </div>

          {/* Aktiviteler */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Son Aktiviteler
              </h2>
              <ActivityList activities={activities} />
            </div>
          </div>
        </div>

        {/* Proje Durumları */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Proje Durumları
            </h2>
            <ProjectStatusList projects={projectStatuses} />
          </div>
        </div>
      </main>
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
    <Link
      href={href}
      className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
          <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
      </div>
    </Link>
  );
}

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
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <BarChart3 className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
      <div className="mt-4">
        <span className="text-sm text-green-600 dark:text-green-400">{trend}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{description}</span>
      </div>
    </div>
  );
}

function ActivityList({ activities }: { activities: Activity[] }) {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3">
          <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-${activity.color.split('-')[1]}-500`}></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{activity.description}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{activity.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectStatusList({ projects }: { projects: ProjectStatus[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {projects.map((project) => (
        <div key={project.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 dark:text-white">{project.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {project.spoolCount} spool
          </p>
          <div className="mt-2">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              project.status === 'active' ? 'bg-green-100 text-green-800' :
              project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {project.status === 'active' ? 'Aktif' :
               project.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
