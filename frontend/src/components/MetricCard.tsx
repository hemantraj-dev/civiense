import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  trend,
  onClick,
  className = ''
}) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white border border-[#E2E4DF] rounded-xl p-4 shadow-sm transition-all hover:border-[#83A69A] ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="flex items-center justify-between text-[#738087] mb-2">
        <span className="text-xs uppercase tracking-wider font-semibold text-[#738087]">{title}</span>
        <div className="p-2 bg-[#F3F1E9] rounded-lg text-[#267C78]">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline justify-between mt-1">
        <div className="text-2xl font-bold font-heading text-[#172B36]">{value}</div>
        {badge}
      </div>
      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-2 text-xs text-[#738087]">
          {trend && (
            <span className={`font-medium ${trend.isPositive ? 'text-[#438A69]' : 'text-[#C75C54]'}`}>
              {trend.value}
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

