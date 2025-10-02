"use client";

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { WorkspaceLayout } from '@/components/WorkspaceLayout';
import { Section } from '@/components/Section';
import { Chip } from '@/components/Chip';
import { RecentSignals } from '@/components/RecentSignals';
import { AddContactDrawer } from '@/components/AddContactDrawer';
import { Button } from '@/components/Button';
import { Sparkles } from 'lucide-react';
import { useCreoStore } from '@/lib/store';

const TABS = ['Overview', 'People', 'Timeline', 'Playbooks'] as const;

type TabKey = (typeof TABS)[number];

export default function ProspectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    prospects,
    people,
    memories,
    companySignals,
    businesses,
    updateProspect,
  } = useCreoStore();

  const prospect = useMemo(() => prospects.find(item => item.id === params?.id), [prospects, params]);

  const [activeTab, setActiveTab] = useState<TabKey>('Overview');
  const [isContactDrawerOpen, setIsContactDrawerOpen] = useState(false);
  const [notes, setNotes] = useState('');

  if (!prospect) {
    return (
      <WorkspaceLayout>
        <Section title="Prospect not found" description="Return to Prospects to select another record." />
      </WorkspaceLayout>
    );
  }

  const linkedPeople = people.filter(person => person.prospectBusinessId === prospect.id);
  const signals = companySignals[prospect.homeBusinessId] ?? [];
  const homeBusiness = businesses.find(business => business.id === prospect.homeBusinessId);

  const timeline = [
    { id: 'timeline-1', title: 'Discovered by Scout', description: 'Flagged via regional wellness signals.', timestamp: '3 days ago' },
    { id: 'timeline-2', title: 'Contacts enriched by Caleb', description: 'Champion and Decision Maker added to pipeline.', timestamp: '1 day ago' },
  ];

  return (
    <WorkspaceLayout>
      <div className="flex flex-wrap items-center gap-3">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${activeTab === tab ? 'bg-slate-900 text-white shadow dark:bg-slate-100 dark:text-slate-900' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' ? (
        <Section
          title={prospect.name}
          description={prospect.industry ?? 'Industry to classify'}
          actions={
            <Button size="sm" variant="outline" onClick={() => router.push('/prospects')}>
              Back to list
            </Button>
          }
        >
          <div className="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
            <Chip variant="info">Stage: {prospect.stage}</Chip>
            <Chip variant="neutral">Priority: {prospect.priority}</Chip>
            <Chip variant="neutral">ICP Fit: {prospect.icpFit}</Chip>
            <Chip variant="neutral">Owner: {prospect.owner ?? 'Unassigned'}</Chip>
            <Chip variant="neutral">Source: {prospect.source}</Chip>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={() => {
              const nextStage = prospect.stage === 'Qualified' ? 'Pursuing' : 'Qualified';
              updateProspect(prospect.id, { stage: nextStage });
            }}
          >
            Mark next stage
          </Button>
          <RecentSignals signals={signals} />
          <label className="mt-4 block space-y-2 text-sm">
            <span className="text-slate-600 dark:text-slate-300">What to remember</span>
            <textarea
              rows={4}
              value={notes}
              onChange={event => setNotes(event.target.value)}
              placeholder="Drop company-level notes for the next outreach."
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
          </label>
        </Section>
      ) : null}

      {activeTab === 'People' ? (
        <Section
          title="Buying committee"
          description="Everyone Creo AI is engaging at this prospect."
          actions={
            <Button size="sm" className="flex items-center gap-2" onClick={() => setIsContactDrawerOpen(true)}>
              <Sparkles className="h-4 w-4" /> Add Contact
            </Button>
          }
        >
          {linkedPeople.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No contacts yet—add one to brief Creo AI.
            </div>
          ) : (
            <div className="space-y-3">
              {linkedPeople.map(person => (
                <div key={person.id} className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{person.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{person.title ?? 'Role TBD'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{person.email}</p>
                    </div>
                    <Chip variant="info">{person.stage}</Chip>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      ) : null}

      {activeTab === 'Timeline' ? (
        <Section title="Timeline" description="Internal and external signals gathered for this prospect.">
          <div className="space-y-3">
            {timeline.map(item => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm dark:border-slate-700 dark:bg-slate-900/40">
                <p className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{item.timestamp}</p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {activeTab === 'Playbooks' ? (
        <Section title="Autopilot runs" description="Recent Prospect → Contract activities scoped to this business.">
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm dark:border-slate-700 dark:bg-slate-900/40">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900 dark:text-slate-100">Discovery</p>
                <Chip variant="success">Completed</Chip>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Added from the latest Scout crawl for {homeBusiness?.name ?? 'home business'}.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm dark:border-slate-700 dark:bg-slate-900/40">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900 dark:text-slate-100">Enrichment</p>
                <Chip variant="info">Queued</Chip>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Waiting on champions to confirm messaging guardrails.</p>
            </div>
          </div>
        </Section>
      ) : null}

      <AddContactDrawer
        isOpen={isContactDrawerOpen}
        onClose={() => setIsContactDrawerOpen(false)}
        defaultProspectId={prospect.id}
        homeBusinessId={prospect.homeBusinessId}
        onCreate={() => setActiveTab('People')}
      />
    </WorkspaceLayout>
  );
}
