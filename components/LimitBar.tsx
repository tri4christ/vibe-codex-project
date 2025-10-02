import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface LimitBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max: number;
  label?: string;
}

export function LimitBar({ value, max, label, className, ...props }: LimitBarProps) {
  const percentage = Math.min(100, Math.round((value / Math.max(max, 1)) * 100));

  return (
    <div className={cn('space-y-1', className)} {...props}>
      {label ? (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{label}</span>
          <span>
            {value}/{max}
          </span>
        </div>
      ) : null}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-slate-900 transition-all dark:bg-slate-100"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
