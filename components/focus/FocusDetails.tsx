"use client";

import { useState } from 'react';
import type { Focus, FocusStatus } from '@/lib/types';
import { Button } from '@/components/Button';
import { cn } from '@/lib/utils';

interface FocusDetailsProps {
  focus: Focus;
  onUpdate: (patch: Partial<Focus>) => void;
}

export function FocusDetails({ focus, onUpdate }: FocusDetailsProps) {
  const [newTag, setNewTag] = useState('');

  function addTag() {
    const tag = newTag.trim();
    if (!tag || focus.tags.includes(tag)) return;
    onUpdate({ tags: [...focus.tags, tag] });
    setNewTag('');
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {focus.status === 'active' ? (
                  <span className="focus-status-dot" aria-hidden />
                ) : null}
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{focus.title}</h1>
              </div>
              <select
                value={focus.status}
                onChange={event => onUpdate({ status: event.target.value as FocusStatus })}
                className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">{focus.description || 'Describe the focus goals so the crew can orchestrate next steps.'}</p>
          </div>
          <div className="w-full max-w-xs space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/40">
              <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Timeline</p>
              <p>{new Date(focus.startDate).toLocaleDateString()} → {new Date(focus.endDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          {focus.tags.map(tag => (
            <span key={`${focus.id}-${tag}`} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
              #{tag}
              <button
                type="button"
                onClick={() => onUpdate({ tags: focus.tags.filter(item => item !== tag) })}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label={`Remove tag ${tag}`}
              >
                ✕
              </button>
            </span>
          ))}
          <div className="flex items-center gap-2">
            <input
              value={newTag}
              onChange={event => setNewTag(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addTag();
                }
              }}
              placeholder="Add tag"
              className="w-28 rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
            <Button type="button" size="sm" variant="outline" onClick={addTag}>
              Add
            </Button>
          </div>
        </div>
      </header>

      <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
        <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Focus summary</p>
        <p className="mt-2">
          {focus.description || 'Document crew expectations and orchestrations so everyone remains aligned.'}
        </p>
      </div>
    </section>
  );
}
