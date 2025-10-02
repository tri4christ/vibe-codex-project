import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  neutral: 'bg-slate-400',
  success: 'bg-emerald-500',
  info: 'bg-sky-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
};

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  status?: keyof typeof statusStyles;
}

export function StatusDot({ status = 'neutral', className, ...props }: StatusDotProps) {
  return (
    <span
      className={cn('inline-block h-2.5 w-2.5 rounded-full', statusStyles[status], className)}
      {...props}
    />
  );
}
