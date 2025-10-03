"use client";

import { useState } from 'react';
import { Button } from '@/components/Button';

interface FocusComposerProps {
  initialText?: string;
  onAskCrew: (text: string) => void;
}

export function FocusComposer({ initialText, onAskCrew }: FocusComposerProps) {
  const [value, setValue] = useState(initialText ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit() {
    if (!value.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onAskCrew(value.trim());
      setIsSubmitting(false);
    }, 350);
  }

  return (
    <section className="space-y-3 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Describe the focus</h3>
        <Button type="button" size="sm" onClick={handleSubmit} disabled={!value.trim() || isSubmitting}>
          {isSubmitting ? 'Routing…' : 'Ask the Crew'}
        </Button>
      </header>
      <textarea
        value={value}
        onChange={event => setValue(event.target.value)}
        rows={4}
        placeholder="Share the campaign intent, key audiences, and any constraints the crew should respect."
        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      />
    </section>
  );
}
