'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link';
import { BarChart3, Users, Package, Plus, FileText, Truck, Box } from 'lucide-react';
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

  const generateActivities = (projects: any[], spools: any[], personnel: any[], _workOrders: any[], shipments: any[]): Activity[] => {
    const activities: Activity[] = [];

    // Son tamamlanan ürün alt kalemleri
    const recentCompletedSpools = spools
      .filter(spool => spool.status === 'completed')
      .slice(0, 2);

    recentCompletedSpools.forEach(spool => {
      activities.push({
        id: `spool-${spool.id}`,
        type: 'spool_completed',
        title: `Ürün Alt Kalemi ${spool.name} tamamlandı`,
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
        title: `Personel kaydı: ${person.fullName}`,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 opacity-30 dark:opacity-20">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-400/5 dark:to-purple-400/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <div className="text-center mb-8 animate-fade-in-up">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-4 animate-float">
              AtölyeAkış - Üretim Takip Sistemi
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-xl font-medium">
              Projelerinizi ve iş süreçlerinizi kolayca yönetin
            </p>
          </div>
          
          {/* Hızlı Erişim - Modern Design */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/30 p-8 animate-fade-in-up hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                Hızlı Erişim
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <QuickActionCard
                title="Yeni Proje"
                icon="Plus"
                href="/projects/new"
                color="from-emerald-500 to-teal-500"
              />
              <QuickActionCard
                title="Yeni Ürün Alt Kalemi"
                icon="Package"
                href="/spools/new"
                color="from-blue-500 to-cyan-500"
              />
              <QuickActionCard
                title="Yeni İş Emri"
                icon="FileText"
                href="/work-orders/new"
                color="from-purple-500 to-pink-500"
              />
              <QuickActionCard
                title="Yeni Sevkiyat"
                icon="Truck"
                href="/shipments/new"
                color="from-orange-500 to-red-500"
              />
              <QuickActionCard
                title="Yeni Envanter"
                icon="Box"
                href="/inventory/new"
                color="from-indigo-500 to-purple-500"
              />
              <QuickActionCard
                title="Personel Ekle"
                icon="Users"
                href="/personnel/new"
                color="from-pink-500 to-rose-500"
              />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* İstatistikler - Modern Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <StatCard 
            title="Toplam Projeler" 
            value={stats.totalProjects.toString()} 
            icon={<Package className="w-7 h-7" />}
            color="from-blue-500 via-blue-600 to-cyan-500"
          />
          <StatCard 
            title="Aktif Projeler" 
            value={stats.activeProjects.toString()} 
            icon={<BarChart3 className="w-7 h-7" />}
            color="from-emerald-500 via-green-500 to-teal-500"
          />
          <StatCard 
            title="Toplam Ürün Alt Kalemi" 
            value={stats.totalSpools.toString()} 
            icon={<Box className="w-7 h-7" />}
            color="from-orange-500 via-amber-500 to-yellow-500"
          />
          <StatCard 
            title="Bekleyen Sevkiyat" 
            value={stats.pendingShipments.toString()} 
            icon={<Truck className="w-7 h-7" />}
            color="from-indigo-500 via-purple-500 to-pink-500"
          />
          <StatCard 
            title="Tamamlanan Projeler" 
            value={stats.completedProjects.toString()} 
            icon={<FileText className="w-7 h-7" />}
            color="from-purple-500 via-violet-500 to-fuchsia-500"
          />
          <StatCard 
            title="Toplam Personel" 
            value={stats.totalPersonnel.toString()} 
            icon={<Users className="w-7 h-7" />}
            color="from-pink-500 to-rose-500"
          />
        </div>

        {/* İçerik Grid - Modern Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Son Aktiviteler - Modern Card */}
          <div className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/30 p-8 hover:shadow-3xl transition-all duration-500 animate-fade-in-up overflow-hidden">
            {/* Floating Orb */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl animate-float"></div>
            
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                {/* Icon Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 opacity-50 blur-md"></div>
                <BarChart3 className="w-6 h-6 text-white relative z-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Son Aktiviteler
              </h2>
            </div>
            <ActivityList activities={activities} />
            
            {/* Border Glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
          </div>

          {/* Proje Durumları - Modern Card */}
          <div className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/30 p-8 hover:shadow-3xl transition-all duration-500 animate-fade-in-up overflow-hidden">
            {/* Floating Orb */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-float"></div>
            
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                {/* Icon Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-50 blur-md"></div>
                <Package className="w-6 h-6 text-white relative z-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Proje Durumları
              </h2>
            </div>
            <ProjectStatusList projects={projectStatuses} />
            
            {/* Border Glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
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
  color?: string;
}

function QuickActionCard({ title, icon, href, color = "from-blue-500 to-purple-500" }: QuickActionCardProps) {
  const iconMap = {
    Plus: Plus,
    Package: Package,
    FileText: FileText,
    Truck: Truck,
    Box: Box,
    Users: Users,
  };

  const IconComponent = iconMap[icon as keyof typeof iconMap] || Plus;

  return (
    <Link href={href}>
      <div className="group relative overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-3xl transition-all duration-500 border border-white/30 dark:border-gray-700/30 hover:scale-110 hover:-translate-y-3 cursor-pointer animate-fade-in-up">
        {/* Animated Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-15 transition-all duration-500`}></div>
        
        {/* Floating Particles Effect */}
        <div className={`absolute top-2 right-2 w-3 h-3 bg-gradient-to-br ${color} rounded-full opacity-40 group-hover:opacity-70 transition-all duration-500 animate-pulse`}></div>
        <div className={`absolute bottom-2 left-2 w-2 h-2 bg-gradient-to-br ${color} rounded-full opacity-30 group-hover:opacity-60 transition-all duration-700 animate-pulse`}></div>
        
        {/* Content */}
        <div className="relative flex flex-col items-center text-center space-y-3 z-10">
          <div className={`p-4 bg-gradient-to-br ${color} rounded-2xl shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative overflow-hidden`}>
            {/* Icon Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-50 blur-md`}></div>
            <div className="relative z-10">
              <IconComponent className="w-7 h-7 text-white" />
            </div>
          </div>
          <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors leading-tight uppercase tracking-wide">
            {title}
          </span>
        </div>
        
        {/* Enhanced Hover Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Border Glow */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${color} opacity-0 group-hover:opacity-25 transition-opacity duration-500 blur-sm`}></div>
      </div>
    </Link>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  color?: string;
}

function StatCard({ title, value, icon, color = "from-blue-500 to-purple-500" }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 shadow-xl hover:shadow-3xl transition-all duration-500 border border-white/30 dark:border-gray-700/30 hover:scale-105 hover:-translate-y-2 animate-fade-in-up">
      {/* Animated Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-15 transition-all duration-500`}></div>
      
      {/* Floating Orb Effect */}
      <div className={`absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br ${color} rounded-full opacity-20 group-hover:opacity-30 transition-all duration-500 blur-xl`}></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
           <div className={`p-4 bg-gradient-to-br ${color} rounded-2xl shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 text-white relative overflow-hidden`}>
             {/* Icon Glow Effect */}
             <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-50 blur-md`}></div>
             <div className="relative z-10">
               {icon || <BarChart3 className="w-7 h-7" />}
             </div>
           </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-4xl font-bold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">{value}</p>
        </div>
      </div>
      
      {/* Enhanced Hover Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Border Glow */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-sm`}></div>
    </div>
  );
}

function ActivityList({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
          <BarChart3 className="w-10 h-10 text-emerald-500" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          Henüz aktivite bulunmuyor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.slice(0, 5).map((activity, index) => (
        <div key={activity.id} className="group relative">
          <div className="flex items-start space-x-4 p-5 rounded-2xl hover:bg-white/70 dark:hover:bg-gray-700/70 transition-all duration-300 border border-transparent hover:border-emerald-200/50 dark:hover:border-emerald-700/50 hover:shadow-lg backdrop-blur-sm hover:scale-[1.02]">
            <div className="relative">
              <div className={`w-4 h-4 rounded-full ${activity.color} shadow-xl ring-2 ring-white/50 dark:ring-gray-800/50`}></div>
              {index < activities.slice(0, 5).length - 1 && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-px h-10 bg-gradient-to-b from-gray-300 to-transparent dark:from-gray-600"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">{activity.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{activity.description}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 font-semibold uppercase tracking-wider">{activity.timestamp}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectStatusList({ projects }: { projects: ProjectStatus[] }) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
          <Package className="w-10 h-10 text-purple-500" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          Henüz proje bulunmuyor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project, index) => (
        <div key={project.id} className="group relative overflow-hidden bg-white/70 dark:bg-gray-700/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/30 dark:border-gray-600/30 hover:scale-[1.03] hover:-translate-y-1">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Floating Particles */}
          <div className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-40 group-hover:opacity-70 transition-all duration-500 animate-pulse"></div>
          
          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-purple-400 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative overflow-hidden">
                  {/* Number Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-50 blur-md"></div>
                  <span className="relative z-10">{index + 1}</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 text-base">{project.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                    {project.spoolCount} ürün alt kalemi
                  </p>
                </div>
              </div>
              
              <span className={`inline-flex px-4 py-2 text-xs font-bold rounded-2xl shadow-lg backdrop-blur-sm border transition-all duration-300 ${
                project.status === 'active' ? 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700' :
                project.status === 'completed' ? 'bg-blue-100/80 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400 border-blue-200 dark:border-blue-700' :
                'bg-gray-100/80 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300 border-gray-200 dark:border-gray-600'
              }`}>
                {project.status === 'active' ? 'Aktif' :
                 project.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
              </span>
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className="w-full bg-gray-200/80 dark:bg-gray-600/80 rounded-full h-3 mt-5 overflow-hidden backdrop-blur-sm shadow-inner">
              <div 
                className={`h-3 rounded-full transition-all duration-700 shadow-lg relative overflow-hidden ${
                  project.status === 'completed' ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 w-full' :
                  project.status === 'active' ? 'bg-gradient-to-r from-purple-500 via-purple-400 to-pink-500 w-3/4' :
                  'bg-gradient-to-r from-gray-400 via-gray-300 to-gray-500 w-1/4'
                }`}
              >
                {/* Progress Bar Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent opacity-50 animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Hover Effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Border Glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
        </div>
      ))}
    </div>
  );
}
