"use client";

import { useMemo } from 'react';
import type { Focus, FocusStatus } from '@/lib/types';
import { Button } from '@/components/Button';
import { cn } from '@/lib/utils';

interface FocusListProps {
  focuses: Focus[];
  visible: Focus[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  statusFilter: FocusStatus | 'all';
  onStatusChange: (value: FocusStatus | 'all') => void;
  searchQuery: string;
  onSearch: (value: string) => void;
}

const statusLabels: Record<FocusStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  completed: 'Completed',
};

export function FocusList({
  focuses,
  visible,
  selectedId,
  onSelect,
  onCreate,
  statusFilter,
  onStatusChange,
  searchQuery,
  onSearch,
}: FocusListProps) {
  const statusCounts = useMemo(() => {
    return focuses.reduce<Record<FocusStatus, number>>(
      (acc, item) => {
        acc[item.status] += 1;
        return acc;
      },
      { draft: 0, active: 0, completed: 0 },
    );
  }, [focuses]);

  return (
    <aside className="flex h-full w-full max-w-xs flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Focus Library</h2>
        <Button size="sm" variant="outline" onClick={onCreate}>
          + New Focus
        </Button>
      </div>
      <div className="flex gap-2">
        <input
          value={searchQuery}
          onChange={event => onSearch(event.target.value)}
          placeholder="Search"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          aria-label="Search focus"
        />
      </div>
      <div className="flex gap-2">
        <StatusPill
          label="All"
          count={focuses.length}
          active={statusFilter === 'all'}
          onClick={() => onStatusChange('all')}
        />
        {(Object.keys(statusLabels) as FocusStatus[]).map(status => (
          <StatusPill
            key={status}
            label={statusLabels[status]}
            count={statusCounts[status]}
            active={statusFilter === status}
            onClick={() => onStatusChange(status)}
          />
        ))}
      </div>
      <div className="-mx-2 flex-1 space-y-2 overflow-y-auto px-2">
        {visible.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            {focuses.length === 0
              ? 'No focus programs yet. Create one to orchestrate the crew.'
              : 'No focus matches your filters right now.'}
          </p>
        ) : null}
        {visible.map(focus => {
          const isActive = selectedId === focus.id;
          return (
            <button
              key={focus.id}
              onClick={() => onSelect(focus.id)}
              className={cn(
                'flex w-full flex-col gap-2 rounded-2xl border px-4 py-3 text-left transition focus:outline-none',
                isActive
                  ? 'border-slate-900 bg-slate-900 text-white shadow dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
              )}
              aria-current={isActive}
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-wide">
                <span>{statusLabels[focus.status]}</span>
                <span>{new Date(focus.updatedAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm font-semibold leading-snug">{focus.title}</p>
              <div className="flex flex-wrap gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                {focus.tags.slice(0, 3).map(tag => (
                  <span key={`${focus.id}-${tag}`} className="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
                    #{tag}
                  </span>
                ))}
                {focus.tags.length > 3 ? <span>+{focus.tags.length - 3}</span> : null}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function StatusPill({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 rounded-full border px-3 py-1 text-xs font-medium transition',
        active
          ? 'border-slate-900 bg-slate-900 text-white shadow-sm dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
      )}
      aria-pressed={active}
    >
      {label} ({count})
    </button>
  );
}
