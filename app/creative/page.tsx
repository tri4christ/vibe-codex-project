"use client";

import { useState } from 'react';
import { WorkspaceLayout } from '@/components/WorkspaceLayout';
import { Section } from '@/components/Section';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useCreoStore } from '@/lib/store';
import type { CreativeDraft } from '@/lib/mockData';
import { Sparkles } from 'lucide-react';

export default function CreativePage() {
  const { businesses, activeHomeBusinessId, setBusinesses } = useCreoStore();
  const activeBusiness = businesses.find(business => business.id === activeHomeBusinessId);

  const [title, setTitle] = useState('');
  const [brief, setBrief] = useState('');
  const [tone, setTone] = useState('Friendly');
  const [cta, setCta] = useState('Schedule a Call');

  if (!activeBusiness) {
    return (
      <WorkspaceLayout>
        <Section title="No business selected" description="Choose a Home Business to manage creative briefs." />
      </WorkspaceLayout>
    );
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;
    const draft: CreativeDraft = {
      id: `creative-${Date.now()}`,
      title: title.trim(),
      brief: brief.trim(),
      tone,
      cta: cta.trim(),
      status: 'Draft',
    };
    setBusinesses(prev =>
      prev.map(business =>
        business.id === activeBusiness.id
          ? { ...business, creativeDrafts: [draft, ...business.creativeDrafts] }
          : business,
      ),
    );
    setTitle('');
    setBrief('');
    setTone('Friendly');
    setCta('Schedule a Call');
  };

  return (
    <WorkspaceLayout>
      <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <Section title="Brief new creative" description="Creo AI will scaffold drafts that your team can polish.">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="space-y-2 text-sm">
              <span className="text-slate-600 dark:text-slate-300">Campaign title</span>
              <input
                value={title}
                onChange={event => setTitle(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-slate-600 dark:text-slate-300">Creative brief</span>
              <textarea
                value={brief}
                onChange={event => setBrief(event.target.value)}
                rows={4}
                required
                placeholder="Outline the transformation, audience, and any guardrails."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="text-slate-600 dark:text-slate-300">Tone</span>
                <select
                  value={tone}
                  onChange={event => setTone(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  {['Friendly', 'Confident', 'Bold', 'Warm', 'Inspiring'].map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm">
                <span className="text-slate-600 dark:text-slate-300">Call to action</span>
                <input
                  value={cta}
                  onChange={event => setCta(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                />
              </label>
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Draft creative
              </Button>
            </div>
          </form>
        </Section>
        <Section title="Creative library" description="Current drafts ready for feedback.">
          <div className="space-y-3">
            {activeBusiness.creativeDrafts.map(draft => (
              <div key={draft.id} className="space-y-2 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{draft.title}</p>
                  <Chip variant={draft.status === 'Ready' ? 'success' : 'info'}>{draft.status}</Chip>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tone: {draft.tone}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">CTA: {draft.cta}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{draft.brief}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </WorkspaceLayout>
  );
}
