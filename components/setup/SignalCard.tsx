"use client";

import { Newspaper, Share2 } from 'lucide-react';
import type { SignalItem } from '@/lib/types';

interface SignalCardProps {
  signal: SignalItem;
}

export function SignalCard({ signal }: SignalCardProps) {
  const Icon = signal.kind === 'press' ? Newspaper : Share2;
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm dark:border-slate-700 dark:bg-slate-900/40">
      <Icon className="mt-1 h-4 w-4 text-slate-400" />
      <div className="space-y-1">
        <p className="font-semibold text-slate-900 dark:text-slate-100">{signal.title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {signal.source} · {new Date(signal.publishedAt).toLocaleDateString()}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{signal.takeaway}</p>
      </div>
    </div>
  );
}
