"use client";

import { useState } from 'react';
import { WorkspaceLayout } from '@/components/WorkspaceLayout';
import { Section } from '@/components/Section';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';

export default function SettingsPage() {
  const [brandName, setBrandName] = useState('Creo Wellness Collective');
  const [primaryColor, setPrimaryColor] = useState('#0ea5e9');
  const [businessHours, setBusinessHours] = useState('Mon-Fri: 8am – 6pm\nSat: 9am – 1pm');
  const [aiApprovalsEnabled, setAiApprovalsEnabled] = useState(true);
  const [justSaved, setJustSaved] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <WorkspaceLayout>
      <Section title="Workspace settings" description="Adjust brand defaults and guardrails for Creo AI.">
        {justSaved ? (
          <Chip variant="success" className="flex items-center gap-2 text-xs">
            Saved
          </Chip>
        ) : null}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="text-slate-600 dark:text-slate-300">Brand name</span>
              <input
                value={brandName}
                onChange={event => setBrandName(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-slate-600 dark:text-slate-300">Primary color</span>
              <input
                value={primaryColor}
                onChange={event => setPrimaryColor(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
            </label>
          </div>
          <label className="space-y-2 text-sm">
            <span className="text-slate-600 dark:text-slate-300">Business hours</span>
            <textarea
              value={businessHours}
              onChange={event => setBusinessHours(event.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/40">
            <input
              type="checkbox"
              checked={aiApprovalsEnabled}
              onChange={event => setAiApprovalsEnabled(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 dark:border-slate-600 dark:text-slate-100"
            />
            Enable AI approvals before publishing updates
          </label>
          <div className="flex justify-end">
            <Button type="submit" className="px-6">
              Save changes
            </Button>
          </div>
        </form>
      </Section>
    </WorkspaceLayout>
  );
}
