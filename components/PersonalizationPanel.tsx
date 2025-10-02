"use client";

import { useMemo, useState } from 'react';
import { useCreoStore } from '@/lib/store';
import type { ContactMemory, MemoryFact, SignalItem } from '@/lib/types';
import { freshness, freshnessColor } from '@/lib/mock';
import { Chip } from '@/components/Chip';
import { Button } from '@/components/Button';
import { cn } from '@/lib/utils';
import { Info, Sparkles } from 'lucide-react';

interface PersonalizationPanelProps {
  contactId?: string;
  memory?: ContactMemory;
  signals?: SignalItem[];
}

export function PersonalizationPanel({ contactId, memory, signals }: PersonalizationPanelProps) {
  const { toggleFactUse } = useCreoStore();
  const [toneIncluded, setToneIncluded] = useState(true);
  const [newsIncluded, setNewsIncluded] = useState(true);

  const tone = memory?.traits.preferences.tone;
  const interests = memory?.traits.interests.slice(0, 2) ?? [];

  const latestPress = signals?.find(signal => signal.kind === 'press');

  const factRows = useMemo(() => {
    if (!memory) return [] as MemoryFact[];
    return memory.facts
      .filter(fact => {
        const label = freshness(fact.lastSeenAt);
        if (label === 'Cold') return false;
        return fact.confidence >= 0.6;
      })
      .slice(0, 3);
  }, [memory]);

  return (
    <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white/80 p-5 text-sm dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Draft personalization</h3>
        <Button size="sm" variant="outline" className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" />
          Auto-tune
        </Button>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        We default to Hot/Warm insights with ≥60% confidence. Cold facts stay unchecked until you confirm.
      </p>
      <div className="space-y-3">
        {tone ? (
          <PanelRow
            title="Tone"
            description={`Write in a ${tone.toLowerCase()} voice.`}
            included={toneIncluded}
            onToggle={setToneIncluded}
            pill={tone}
          />
        ) : null}
        {interests.length ? (
          <PanelRow
            title="Key interests"
            description={interests.join(', ')}
            included={true}
            onToggle={() => undefined}
            pill="Hot"
            disabled
          />
        ) : null}
        {latestPress ? (
          <PanelRow
            title="Recent press"
            description={`${latestPress.title}`}
            included={newsIncluded}
            onToggle={setNewsIncluded}
            pill={`${latestPress.source} · ${new Date(latestPress.publishedAt).toLocaleDateString()}`}
          />
        ) : null}
        {memory && factRows.length && contactId ? (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Hot & warm facts
            </h4>
            {factRows.map(fact => (
              <FactToggle
                key={fact.id}
                fact={fact}
                contactId={contactId}
                onToggle={(value: boolean) => toggleFactUse(contactId, fact.id, value)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </aside>
  );
}

interface PanelRowProps {
  title: string;
  description: string;
  pill: string;
  included: boolean;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
}

function PanelRow({ title, description, pill, included, onToggle, disabled }: PanelRowProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-900/50">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <label className={cn('inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400', disabled && 'opacity-60')}>
          <input
            type="checkbox"
            checked={included}
            onChange={event => onToggle(event.target.checked)}
            disabled={disabled}
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 dark:border-slate-600 dark:text-slate-100"
          />
          Include
        </label>
      </div>
      <Chip className="mt-2 bg-slate-100 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{pill}</Chip>
    </div>
  );
}

function FactToggle({ fact, contactId, onToggle }: { fact: MemoryFact; contactId: string; onToggle: (value: boolean) => void }) {
  const label = freshness(fact.lastSeenAt);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/60 p-3 text-xs dark:border-slate-700 dark:bg-slate-900/40">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{fact.label}</p>
          <p className="text-slate-500 dark:text-slate-400">
            {fact.snippet ?? 'Use this insight when drafting the next touchpoint.'}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <Chip className={cn('px-2 py-0.5', freshnessColor(label))}>{label}</Chip>
            <span>{Math.round(fact.confidence * 100)}% confidence</span>
          </div>
        </div>
        <label className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <input
            type="checkbox"
            checked={fact.useInPersonalization}
            onChange={event => onToggle(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 dark:border-slate-600 dark:text-slate-100"
          />
          Include
        </label>
      </div>
      {label === 'Cold' ? (
        <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-300">
          <Info className="h-3 w-3" />
          This is older than 60 days; confirm before using.
        </div>
      ) : null}
    </div>
  );
}
