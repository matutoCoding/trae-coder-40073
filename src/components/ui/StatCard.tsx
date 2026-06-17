import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type StatColor = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  trend?: {
    value: number;
    label?: string;
  };
  color?: StatColor;
  suffix?: string;
  className?: string;
  onClick?: () => void;
}

const colorConfig: Record<StatColor, { bg: string; icon: string; text: string; gradient: string }> = {
  primary: {
    bg: 'from-primary-50 to-white',
    icon: 'bg-primary-100 text-primary-600',
    text: 'text-primary-600',
    gradient: 'bg-gradient-to-br from-primary-500/5 via-transparent to-transparent',
  },
  accent: {
    bg: 'from-accent-50 to-white',
    icon: 'bg-accent-100 text-accent-500',
    text: 'text-accent-500',
    gradient: 'bg-gradient-to-br from-accent-500/5 via-transparent to-transparent',
  },
  success: {
    bg: 'from-success-light to-white',
    icon: 'bg-success-light text-success',
    text: 'text-success',
    gradient: 'bg-gradient-to-br from-success/5 via-transparent to-transparent',
  },
  warning: {
    bg: 'from-warning-light to-white',
    icon: 'bg-warning-light text-warning',
    text: 'text-warning',
    gradient: 'bg-gradient-to-br from-warning/5 via-transparent to-transparent',
  },
  danger: {
    bg: 'from-danger-light to-white',
    icon: 'bg-danger-light text-danger',
    text: 'text-danger',
    gradient: 'bg-gradient-to-br from-danger/5 via-transparent to-transparent',
  },
  info: {
    bg: 'from-info-light to-white',
    icon: 'bg-info-light text-info',
    text: 'text-info',
    gradient: 'bg-gradient-to-br from-info/5 via-transparent to-transparent',
  },
};

const StatCard = ({
  icon: Icon,
  title,
  value,
  trend,
  color = 'primary',
  suffix,
  className,
  onClick,
}: StatCardProps) => {
  const config = colorConfig[color];

  return (
    <div
      onClick={onClick}
      className={cn(
        'stat-card bg-gradient-to-br',
        config.bg,
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div className={cn('absolute inset-0', config.gradient)} />
      <div className="relative">
        <div className="stat-label">{title}</div>
        <div className="stat-value flex items-baseline gap-1">
          <span>{value}</span>
          {suffix && <span className="text-sm font-normal text-neutral-500">{suffix}</span>}
        </div>
        {trend && (
          <div className={cn(
            'stat-trend',
            trend.value > 0 ? 'text-success' : trend.value < 0 ? 'text-danger' : 'text-neutral-500'
          )}>
            {trend.value > 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : trend.value < 0 ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            <span>{Math.abs(trend.value)}%</span>
            {trend.label && <span className="text-neutral-400">{trend.label}</span>}
          </div>
        )}
        <div className={cn('stat-icon', config.icon)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
