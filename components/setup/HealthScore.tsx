"use client";

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

const BAND_COLORS: Record<'red' | 'amber' | 'green', { ring: string; text: string }> = {
  red: { ring: '#f97316', text: 'text-orange-500' },
  amber: { ring: '#facc15', text: 'text-amber-500' },
  green: { ring: '#22c55e', text: 'text-emerald-500' },
};

interface HealthScoreProps {
  score: number;
  band: 'red' | 'amber' | 'green';
  size?: number;
  label?: string;
}

export function HealthScore({ score, band, size = 96, label }: HealthScoreProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const { ring, text } = BAND_COLORS[band];

  const circleStyle = useMemo(() => ({
    width: `${size}px`,
    height: `${size}px`,
    background: `conic-gradient(${ring} ${clamped * 3.6}deg, rgba(148, 163, 184, 0.25) 0deg)` ,
  }), [ring, clamped, size]);

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div
        className="relative flex items-center justify-center rounded-full p-[10px]"
        style={circleStyle}
      >
        <div className="flex h-[calc(100%-20px)] w-[calc(100%-20px)] flex-col items-center justify-center rounded-full bg-white text-xs shadow-inner dark:bg-slate-900">
          <span className={cn('text-lg font-semibold', text)}>{clamped}</span>
          <span className="text-[10px] uppercase tracking-wide text-slate-400">Score</span>
        </div>
      </div>
      {label ? <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span> : null}
    </div>
  );
}
