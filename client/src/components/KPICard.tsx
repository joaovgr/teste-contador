import { KPIData } from '@/lib/kpiData';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface KPICardProps {
  kpi: KPIData;
}

export function KPICard({ kpi }: KPICardProps) {
  const getTrendColor = () => {
    if (kpi.trend === 'up') return 'text-green-600';
    if (kpi.trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = () => {
    if (kpi.trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (kpi.trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  const getBackgroundColor = () => {
    const colorMap: { [key: string]: string } = {
      'bg-green-500': 'from-green-50 to-green-100 border-green-200',
      'bg-blue-500': 'from-blue-50 to-blue-100 border-blue-200',
      'bg-yellow-500': 'from-yellow-50 to-yellow-100 border-yellow-200',
      'bg-red-500': 'from-red-50 to-red-100 border-red-200',
      'bg-purple-500': 'from-purple-50 to-purple-100 border-purple-200',
      'bg-emerald-500': 'from-emerald-50 to-emerald-100 border-emerald-200',
      'bg-teal-500': 'from-teal-50 to-teal-100 border-teal-200',
      'bg-orange-500': 'from-orange-50 to-orange-100 border-orange-200',
      'bg-indigo-500': 'from-indigo-50 to-indigo-100 border-indigo-200',
      'bg-pink-500': 'from-pink-50 to-pink-100 border-pink-200',
      'bg-green-600': 'from-green-50 to-green-100 border-green-200',
      'bg-red-600': 'from-red-50 to-red-100 border-red-200',
      'bg-gray-500': 'from-gray-50 to-gray-100 border-gray-200',
      'bg-blue-600': 'from-blue-50 to-blue-100 border-blue-200',
      'bg-amber-600': 'from-amber-50 to-amber-100 border-amber-200',
      'bg-cyan-500': 'from-cyan-50 to-cyan-100 border-cyan-200',
      'bg-fuchsia-500': 'from-fuchsia-50 to-fuchsia-100 border-fuchsia-200',
      'bg-lime-500': 'from-lime-50 to-lime-100 border-lime-200',
      'bg-rose-500': 'from-rose-50 to-rose-100 border-rose-200',
      'bg-violet-500': 'from-violet-50 to-violet-100 border-violet-200',
    };
    return colorMap[kpi.color || 'bg-blue-500'] || 'from-blue-50 to-blue-100 border-blue-200';
  };

  const getIconColor = () => {
    const colorMap: { [key: string]: string } = {
      'bg-green-500': 'text-green-600',
      'bg-blue-500': 'text-blue-600',
      'bg-yellow-500': 'text-yellow-600',
      'bg-red-500': 'text-red-600',
      'bg-purple-500': 'text-purple-600',
      'bg-emerald-500': 'text-emerald-600',
      'bg-teal-500': 'text-teal-600',
      'bg-orange-500': 'text-orange-600',
      'bg-indigo-500': 'text-indigo-600',
      'bg-pink-500': 'text-pink-600',
      'bg-green-600': 'text-green-600',
      'bg-red-600': 'text-red-600',
      'bg-gray-500': 'text-gray-600',
      'bg-blue-600': 'text-blue-600',
      'bg-amber-600': 'text-amber-600',
      'bg-cyan-500': 'text-cyan-600',
      'bg-fuchsia-500': 'text-fuchsia-600',
      'bg-lime-500': 'text-lime-600',
      'bg-rose-500': 'text-rose-600',
      'bg-violet-500': 'text-violet-600',
    };
    return colorMap[kpi.color || 'bg-blue-500'] || 'text-blue-600';
  };

  return (
    <div
      className={`bg-gradient-to-br ${getBackgroundColor()} rounded-lg p-6 border shadow-sm hover:shadow-md transition-shadow duration-300`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{kpi.label}</p>
          <p className={`text-3xl font-bold ${getIconColor()}`}>{kpi.value}</p>
        </div>
        <div className={`text-2xl ${getIconColor()}`}>{kpi.icon}</div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{kpi.unit}</p>
        {kpi.change !== undefined && (
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-semibold">
              {kpi.change > 0 ? '+' : ''}{kpi.change}%
            </span>
          </div>
        )}
      </div>

      {kpi.target !== undefined && (
        <div className="mt-3 pt-3 border-t border-gray-200 border-opacity-50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Meta:</span>
            <span className="font-semibold text-gray-700">{kpi.target}</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${kpi.color || 'bg-blue-500'} transition-all duration-500`}
              style={{
                width: `${Math.min(
                  (Number(typeof kpi.value === 'string' ? kpi.value.replace(/\D/g, '') : kpi.value) / kpi.target) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
