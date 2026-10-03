import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn.js';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: {
    value: number | string;
    isPositive?: boolean;
    label?: string;
  };
  source?: 'manual' | 'imported' | 'estimated' | 'device' | string;
  progress?: {
    current: number;
    target: number;
    color?: string;
  };
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  iconColor = 'text-brand-600 dark:text-brand-400',
  iconBg = 'bg-brand-50 dark:bg-brand-950/40',
  trend,
  source,
  progress,
  onClick,
  className,
}) => {
  const percent = progress && progress.target > 0
    ? Math.min(100, Math.round((progress.current / progress.target) * 100))
    : null;

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-darkbg-800 rounded-2xl p-5 border border-cream-200 dark:border-darkbg-700 shadow-sm transition-all duration-200 hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700',
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
            <Icon className={cn('w-5 h-5', iconColor)} />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {title}
            </h3>
            {source && (
              <span
                className={cn(
                  'inline-block px-1.5 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase',
                  source === 'manual' && 'bg-slate-100 dark:bg-darkbg-700 text-slate-600 dark:text-slate-400',
                  source === 'estimated' && 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/50',
                  (source === 'imported' || source === 'device') && 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/50'
                )}
              >
                {source}
              </span>
            )}
          </div>
        </div>

        {trend && (
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              trend.isPositive
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
            )}
          >
            {trend.value} {trend.label}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 mt-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {unit}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
          {subtitle}
        </p>
      )}

      {percent !== null && progress && (
        <div className="mt-3">
          <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span>{progress.current.toLocaleString()} / {progress.target.toLocaleString()} {unit}</span>
            <span>{percent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-darkbg-700 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', progress.color || 'bg-brand-500')}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
