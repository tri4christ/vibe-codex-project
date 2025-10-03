"use client";

import { useState } from 'react';
import type { FocusKpi } from '@/lib/types';
import { Button } from '@/components/Button';
import { cn } from '@/lib/utils';

interface FocusKPIsProps {
  kpis: FocusKpi[];
  onChange: (kpis: FocusKpi[]) => void;
}

export function FocusKPIs({ kpis, onChange }: FocusKPIsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  function mutate(updater: (current: FocusKpi[]) => FocusKpi[]) {
    const next = updater(kpis);
    onChange(next);
  }

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">KPIs</h3>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            mutate(current => [
              ...current,
              {
                id: `kpi-${Date.now()}`,
                label: 'New KPI',
                target: '',
                progress: '',
              },
            ])
          }
        >
          + Add KPI
        </Button>
      </header>
      <div className="space-y-3">
        {kpis.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No KPIs yet. Add one to track this focus.
          </p>
        ) : null}
        {kpis.map(kpi => {
          const isEditing = editingId === kpi.id;
          return (
            <div
              key={kpi.id}
              className="rounded-2xl border border-slate-200 bg-white/80 p-4 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      value={kpi.label}
                      onChange={event =>
                        mutate(current =>
                          current.map(item => (item.id === kpi.id ? { ...item, label: event.target.value } : item)),
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-slate-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{kpi.label}</p>
                  )}
                  <div className="mt-2 grid gap-2 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-2">
                    <label className="flex flex-col gap-1">
                      <span>Target</span>
                      <input
                        value={kpi.target ?? ''}
                        onChange={event =>
                          mutate(current =>
                            current.map(item => (item.id === kpi.id ? { ...item, target: event.target.value } : item)),
                          )
                        }
                        className="rounded-xl border border-slate-300 bg-white px-2 py-1 text-sm text-slate-600 focus:border-slate-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span>Progress</span>
                      <input
                        value={kpi.progress ?? ''}
                        onChange={event =>
                          mutate(current =>
                            current.map(item => (item.id === kpi.id ? { ...item, progress: event.target.value } : item)),
                          )
                        }
                        className="rounded-xl border border-slate-300 bg-white px-2 py-1 text-sm text-slate-600 focus:border-slate-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                      />
                    </label>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <button
                    type="button"
                    onClick={() => setEditingId(isEditing ? null : kpi.id)}
                    className="rounded-xl border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-slate-200"
                  >
                    {isEditing ? 'Done' : 'Rename'}
                  </button>
                  <button
                    type="button"
                    onClick={() => mutate(current => current.filter(item => item.id !== kpi.id))}
                    className="rounded-xl border border-transparent px-2 py-1 text-xs font-medium text-rose-500 transition hover:text-rose-600 dark:text-rose-300 dark:hover:text-rose-200"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
