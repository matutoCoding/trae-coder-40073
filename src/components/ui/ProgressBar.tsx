import { cn } from '../../lib/utils';

type ProgressColor = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: ProgressColor;
  showLabel?: boolean;
  labelPosition?: 'inside' | 'outside' | 'right';
  size?: 'sm' | 'md' | 'lg';
  striped?: boolean;
  animated?: boolean;
  className?: string;
  trackClassName?: string;
  barClassName?: string;
}

const colorClasses: Record<ProgressColor, string> = {
  primary: 'bg-gradient-to-r from-primary-500 to-primary-700',
  accent: 'bg-gradient-to-r from-accent to-accent-700',
  success: 'bg-gradient-to-r from-success to-success-dark',
  warning: 'bg-gradient-to-r from-warning to-warning-dark',
  danger: 'bg-gradient-to-r from-danger to-danger-dark',
  info: 'bg-gradient-to-r from-info to-info-dark',
};

const sizeClasses: Record<string, { track: string; text: string }> = {
  sm: { track: 'h-1.5', text: 'text-[10px]' },
  md: { track: 'h-2', text: 'text-xs' },
  lg: { track: 'h-3', text: 'text-xs' },
};

const ProgressBar = ({
  value,
  max = 100,
  color = 'primary',
  showLabel = false,
  labelPosition = 'right',
  size = 'md',
  striped = false,
  animated = false,
  className,
  trackClassName,
  barClassName,
}: ProgressBarProps) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const roundedPct = Math.round(percentage);

  return (
    <div className={cn('w-full', className)}>
      {labelPosition === 'outside' && showLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-neutral-600">进度</span>
          <span className={cn('font-semibold tabular-nums', sizeClasses[size].text, `text-${color}`)}>
            {roundedPct}%
          </span>
        </div>
      )}
      <div className="relative flex items-center gap-3">
        <div className={cn('progress-track flex-1', sizeClasses[size].track, trackClassName)}>
          <div
            className={cn(
              'progress-bar',
              colorClasses[color],
              sizeClasses[size].track,
              striped && 'bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]',
              animated && 'animate-[progress_1s_linear_infinite]',
              barClassName
            )}
            style={{
              width: `${percentage}%`,
            }}
          >
            {labelPosition === 'inside' && showLabel && percentage >= 15 && (
              <span className={cn(
                'absolute inset-0 flex items-center justify-center font-bold text-white tabular-nums drop-shadow-sm',
                sizeClasses[size].text
              )}>
                {roundedPct}%
              </span>
            )}
          </div>
        </div>
        {labelPosition === 'right' && showLabel && (
          <span className={cn(
            'font-semibold tabular-nums min-w-[38px] text-right',
            sizeClasses[size].text,
            color === 'primary' && 'text-primary-700',
            color === 'accent' && 'text-accent-600',
            color === 'success' && 'text-success',
            color === 'warning' && 'text-warning',
            color === 'danger' && 'text-danger',
            color === 'info' && 'text-info'
          )}>
            {roundedPct}%
          </span>
        )}
      </div>
      {labelPosition === 'inside' && showLabel && percentage < 15 && (
        <div className="mt-1 text-right">
          <span className={cn(
            'font-semibold tabular-nums',
            sizeClasses[size].text,
            color === 'primary' && 'text-primary-700',
            color === 'accent' && 'text-accent-600',
            color === 'success' && 'text-success',
            color === 'warning' && 'text-warning',
            color === 'danger' && 'text-danger',
            color === 'info' && 'text-info'
          )}>
            {roundedPct}%
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
