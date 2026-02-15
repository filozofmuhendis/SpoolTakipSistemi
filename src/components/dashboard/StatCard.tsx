import { BarChart3 } from 'lucide-react';
import { ReactNode } from 'react';

interface StatCardProps {
    title: string;
    value: string;
    icon?: ReactNode;
    color?: string;
}

export function StatCard({ title, value, icon, color = "from-blue-500 to-purple-500" }: StatCardProps) {
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
