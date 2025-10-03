"use client";

import type { FocusMilestone } from '@/lib/types';
import { Button } from '@/components/Button';

interface FocusMilestonesProps {
  milestones: FocusMilestone[];
  onChange: (milestones: FocusMilestone[]) => void;
}

export function FocusMilestones({ milestones, onChange }: FocusMilestonesProps) {
  function mutate(updater: (current: FocusMilestone[]) => FocusMilestone[]) {
    onChange(updater(milestones));
  }

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Milestones</h3>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            mutate(current => [
              ...current,
              {
                id: `milestone-${Date.now()}`,
                title: 'New milestone',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                completed: false,
              },
            ])
          }
        >
          + Add Milestone
        </Button>
      </header>
      <div className="space-y-3">
        {milestones.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Keep the crew aligned by adding key milestones with due dates.
          </p>
        ) : null}
        {milestones.map(milestone => (
          <label
            key={milestone.id}
            className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/40"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={milestone.completed}
                onChange={event =>
                  mutate(current =>
                    current.map(item =>
                      item.id === milestone.id ? { ...item, completed: event.target.checked } : item,
                    ),
                  )
                }
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 dark:border-slate-600 dark:text-slate-100"
                aria-label={`Mark ${milestone.title} ${milestone.completed ? 'incomplete' : 'complete'}`}
              />
              <input
                value={milestone.title}
                onChange={event =>
                  mutate(current =>
                    current.map(item =>
                      item.id === milestone.id ? { ...item, title: event.target.value } : item,
                    ),
                  )
                }
                className="flex-1 rounded-xl border border-transparent bg-transparent font-semibold text-slate-700 focus:border-slate-300 focus:outline-none dark:text-slate-200"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>
                Due {milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString() : '—'}
              </span>
              <input
                type="date"
                value={milestone.dueDate ? milestone.dueDate.slice(0, 10) : ''}
                onChange={event =>
                  mutate(current =>
                    current.map(item =>
                      item.id === milestone.id ? { ...item, dueDate: event.target.value || undefined } : item,
                    ),
                  )
                }
                className="rounded-xl border border-slate-300 bg-white px-2 py-1 text-xs focus:border-slate-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              />
              <button
                type="button"
                onClick={() => mutate(current => current.filter(item => item.id !== milestone.id))}
                className="text-xs font-medium text-rose-500 transition hover:text-rose-600 dark:text-rose-300 dark:hover:text-rose-200"
              >
                Remove
              </button>
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}
