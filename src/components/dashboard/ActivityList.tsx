import { BarChart3 } from 'lucide-react';

export interface Activity {
    id: string;
    type: 'spool_completed' | 'project_created' | 'shipment_started' | 'personnel_added' | 'work_order_created';
    title: string;
    description: string;
    timestamp: string;
    color: string;
}

interface ActivityListProps {
    activities: Activity[];
}

export function ActivityList({ activities }: ActivityListProps) {
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
