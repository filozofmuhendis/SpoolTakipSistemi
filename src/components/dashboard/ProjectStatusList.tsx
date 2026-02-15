import { Package } from 'lucide-react';

export interface ProjectStatus {
    id: string;
    name: string;
    spoolCount: number;
    status: string;
}

interface ProjectStatusListProps {
    projects: ProjectStatus[];
}

export function ProjectStatusList({ projects }: ProjectStatusListProps) {
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

                            <span className={`inline-flex px-4 py-2 text-xs font-bold rounded-2xl shadow-lg backdrop-blur-sm border transition-all duration-300 ${project.status === 'active' ? 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700' :
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
                                className={`h-3 rounded-full transition-all duration-700 shadow-lg relative overflow-hidden ${project.status === 'completed' ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 w-full' :
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
