import PageInfo from "@/components/PageInfo";
import StatCard from "@/components/StatCard";
import { Activity, Server, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDashboardOverview } from '@/hooks/useApiData';

export default function DashboardPage() {
  const { data: overview, isLoading: loading, error } = useDashboardOverview();

  if (error) {
    toast.error('Failed to load dashboard data');
  }

  if (loading) {
    return (
      <div className="w-full py-4 px-1">
        <PageInfo prevPage="dashboard" currentPage="home" pageTitle="Dashboard" pageDesc="Keep up with devices you're managing."/>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-textcol"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4 px-1 h-dvh overflow-y-auto scrollbar-none scrollbar-gutter-auto">
      <PageInfo prevPage="dashboard" currentPage="home" pageTitle="Dashboard" pageDesc="Keep up with devices you're managing."/>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 pl-4 ">
        <StatCard
          title="Total Devices"
          value={overview?.totalDevices || 0}
          icon={Server}
          description="All monitored devices"
        />
        <StatCard
          title="Healthy Devices"
          value={overview?.healthyDevices || 0}
          icon={CheckCircle}
          description="Devices operating normally"
          trend={overview?.totalDevices ? {
            value: Math.round((overview.healthyDevices / overview.totalDevices) * 100),
            isPositive: true
          } : undefined}
        />
        <StatCard
          title="Down Devices"
          value={overview?.downDevices || 0}
          icon={AlertCircle}
          description="Devices requiring attention"
          trend={overview?.totalDevices ? {
            value: Math.round((overview.downDevices / overview.totalDevices) * 100),
            isPositive: false
          } : undefined}
        />
        <StatCard
          title="Unknown Status"
          value={overview?.unknownDevices || 0}
          icon={Clock}
          description="Devices awaiting status"
        />
        <StatCard
          title="Active Monitors"
          value={overview?.activeMonitors || 0}
          icon={Activity}
          description="Currently monitoring"
        />
        <StatCard
          title="Total Monitors"
          value={overview?.totalMonitors || 0}
          icon={TrendingUp}
          description="All configured monitors"
        />
      </div>

      {/* Recent Activity Section */}
      <div className="mt-8 bg-cards p-6 shadow-sm border border-bordercol m-4">
        <h3 className="text-lg font-semibold text-textcol mb-4 font-space">Recent Activity</h3>
        {overview?.recentActivity && overview.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {overview.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-light border-1 border-bordercol">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    activity.status === 'HEALTHY' ? 'bg-green-500' :
                    activity.status === 'DOWN' ? 'bg-red-500' : 'bg-gray-500'
                  }`} />
                  <span className="font-medium text-textcol font-space">{activity.deviceName}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`text-sm font-medium font-brains ${
                    activity.status === 'HEALTHY' ? 'text-green-600' :
                    activity.status === 'DOWN' ? 'text-red-600' : 'text-seccol'
                  }`}>
                    {activity.status}
                  </span>
                  <span className="text-sm text-seccol font-brains">
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-seccol text-center py-4 font-brains">No recent activity</p>
        )}
      </div>
    </div>
  );
}
