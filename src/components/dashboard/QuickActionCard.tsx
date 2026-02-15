import Link from 'next/link';
import { Plus, Package, FileText, Truck, Box, Users } from 'lucide-react';

interface QuickActionCardProps {
    title: string;
    icon: string;
    href: string;
    color?: string;
}

export function QuickActionCard({ title, icon, href, color = "from-blue-500 to-purple-500" }: QuickActionCardProps) {
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
