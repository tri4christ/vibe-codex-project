import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function Section({
  title,
  description,
  children,
  actions,
  className,
  contentClassName,
}: SectionProps) {
  return (
    <section
      className={cn(
        'rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60',
        className
      )}
    >
      {(title || description || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            {title ? <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2> : null}
            {description ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      )}
      <div className={cn('space-y-4', contentClassName)}>{children}</div>
    </section>
  );
}
