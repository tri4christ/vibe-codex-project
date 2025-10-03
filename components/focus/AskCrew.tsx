"use client";

import { useState } from 'react';
import { Button } from '@/components/Button';

interface AskCrewProps {
  initialValue?: string;
  onSend: (prompt: string) => void;
}

export function AskCrew({ initialValue, onSend }: AskCrewProps) {
  const [value, setValue] = useState(initialValue ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onSend(trimmed);
      setValue('');
      setIsSubmitting(false);
    }, 150);
  }

  return (
    <div className="space-y-3">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Ask the crew</h3>
        <Button type="button" size="sm" onClick={handleSend} disabled={isSubmitting || !value.trim()}>
          {isSubmitting ? 'Routing…' : 'Ask'}
        </Button>
      </header>
      <textarea
        value={value}
        onChange={event => setValue(event.target.value)}
        rows={2}
        className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        placeholder="Share context or request from Leo & Eden."
      />
    </div>
  );
}
