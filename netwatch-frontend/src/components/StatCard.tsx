import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatCard({ title, value, icon: Icon, description, trend }: StatCardProps) {
  return (
    <div className="bg-cards  p-6 shadow-sm border border-bordercol">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-seccol font-brains">{title}</p>
          <p className="text-3xl font-bold text-textcol mt-2 font-space">{value}</p>
          {description && (
            <p className="text-sm text-seccol mt-1 font-brains">{description}</p>
          )}
          {trend && (
            <div className={`flex items-center mt-2 text-sm font-brains ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span className="ml-1">{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-light border-1 border-bordercol">
          <Icon className="text-textcol w-6 h-6" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
