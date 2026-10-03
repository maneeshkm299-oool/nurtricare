import React from 'react';
import { cn } from '../../utils/cn.js';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  sublabel?: string;
  color?: string;
  height?: string;
  showPercent?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  label,
  sublabel,
  color = 'bg-brand-500',
  height = 'h-2.5',
  showPercent = true,
}) => {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          <span>{label}</span>
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            {sublabel && <span>{sublabel}</span>}
            {showPercent && <span className="font-bold text-slate-700 dark:text-slate-200">({percent}%)</span>}
          </div>
        </div>
      )}
      <div className={cn('w-full bg-slate-100 dark:bg-darkbg-700 rounded-full overflow-hidden', height)}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'brand' | 'success' | 'warning' | 'info' | 'neutral' | 'danger';
  className?: string;
}> = ({ children, variant = 'brand', className }) => {
  const variants = {
    brand: 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border-brand-200/60 dark:border-brand-800/40',
    success: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40',
    warning: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40',
    info: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/40',
    neutral: 'bg-slate-100 dark:bg-darkbg-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-darkbg-600',
    danger: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/40'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
