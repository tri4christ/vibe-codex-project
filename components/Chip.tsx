import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const variantStyles: Record<string, string> = {
  neutral: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
  info: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200',
};

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variantStyles;
}

export function Chip({ className, variant = 'neutral', ...props }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
