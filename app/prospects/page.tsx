"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WorkspaceLayout } from '@/components/WorkspaceLayout';
import { Section } from '@/components/Section';
import { Chip } from '@/components/Chip';
import { Button } from '@/components/Button';
import { AddProspectDrawer } from '@/components/AddProspectDrawer';
import { useCreoStore } from '@/lib/store';
import type { ProspectBusiness, ProspectStage } from '@/lib/types';
import { Search, UserPlus, Play, CheckCircle2 } from 'lucide-react';

const STAGE_OPTIONS: ProspectStage[] = ['Discovered', 'Qualified', 'Pursuing', 'Proposal', 'Won', 'Lost'];

export default function ProspectsPage() {
  const router = useRouter();
  const { prospects, addProspect, activeHomeBusinessId, companySignals } = useCreoStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<ProspectStage | 'All'>('All');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [minIcpFit, setMinIcpFit] = useState(60);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [playbookRuns, setPlaybookRuns] = useState<Record<string, 'idle' | 'running' | 'success'>>({});
  const [activityLog, setActivityLog] = useState<Array<{ id: string; prospectId: string; message: string; timestamp: string }>>([]);
  const timersRef = useRef<number[]>([]);

  const homeProspects = useMemo(
    () => prospects.filter(prospect => prospect.homeBusinessId === activeHomeBusinessId),
    [prospects, activeHomeBusinessId],
  );

  const filteredProspects = useMemo(() => {
    return homeProspects.filter(prospect => {
      if (stageFilter !== 'All' && prospect.stage !== stageFilter) return false;
      if (ownerFilter && (prospect.owner ?? '').toLowerCase() !== ownerFilter.toLowerCase()) return false;
      if (prospect.icpFit < minIcpFit) return false;
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        prospect.name.toLowerCase().includes(query) ||
        (prospect.industry ?? '').toLowerCase().includes(query) ||
        (prospect.region ?? '').toLowerCase().includes(query)
      );
    });
  }, [homeProspects, stageFilter, ownerFilter, minIcpFit, searchQuery]);

  const handleCreateProspect = (prospect: ProspectBusiness) => {
    addProspect(prospect);
  };

  useEffect(() => {
    return () => {
      timersRef.current.forEach(timerId => window.clearTimeout(timerId));
      timersRef.current = [];
    };
  }, []);

  const handleRunPlaybook = (prospect: ProspectBusiness) => {
    if (playbookRuns[prospect.id] === 'running') return;

    const queuedEntry = {
      id: `log-${prospect.id}-${Date.now()}`,
      prospectId: prospect.id,
      message: `Playbook queued for ${prospect.name}.`,
      timestamp: new Date().toISOString(),
    };

    setPlaybookRuns(prev => ({ ...prev, [prospect.id]: 'running' }));
    setActivityLog(prev => [queuedEntry, ...prev].slice(0, 10));

    const completionTimer = window.setTimeout(() => {
      const completedEntry = {
        id: `log-${prospect.id}-${Date.now()}`,
        prospectId: prospect.id,
        message: `Playbook completed for ${prospect.name}.`,
        timestamp: new Date().toISOString(),
      };

      setPlaybookRuns(prev => ({ ...prev, [prospect.id]: 'success' }));
      setActivityLog(prev => [completedEntry, ...prev].slice(0, 10));

      const resetTimer = window.setTimeout(() => {
        setPlaybookRuns(prev => ({ ...prev, [prospect.id]: 'idle' }));
      }, 2000);

      timersRef.current.push(resetTimer);
    }, 800);

    timersRef.current.push(completionTimer);
  };

  return (
    <WorkspaceLayout>
      <Section
        title="Prospect Businesses"
        description="Search, filter, and manage every franchise you're pursuing."
        actions={
          <Button onClick={() => setIsDrawerOpen(true)} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add Prospect Business
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder="Search name, industry, region"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
          </div>
          <select
            value={stageFilter}
            onChange={event => setStageFilter(event.target.value as ProspectStage | 'All')}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="All">All stages</option>
            {STAGE_OPTIONS.map(stage => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
          <input
            value={ownerFilter}
            onChange={event => setOwnerFilter(event.target.value)}
            placeholder="Owner"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
          <label className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            ICP Fit ≥ {minIcpFit}
            <input
              type="range"
              min={0}
              max={100}
              value={minIcpFit}
              onChange={event => setMinIcpFit(Number(event.target.value))}
              className="w-full"
            />
          </label>
        </div>
      </Section>

      <Section>
        {filteredProspects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No Prospect Businesses yet. Run Discovery in Playbooks or add a Prospect Business.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProspects.map(prospect => (
              <div
                key={prospect.id}
                className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <Link href={`/prospects/${prospect.id}`} className="text-base font-semibold text-slate-900 underline-offset-2 hover:underline dark:text-slate-100">
                      {prospect.name}
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {prospect.industry ?? 'Industry TBD'} · {prospect.region ?? 'Region TBD'}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                      {prospect.tags.slice(0, 3).map(tag => (
                        <Chip key={`${prospect.id}-${tag}`} className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {tag}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <Chip variant="info">{prospect.stage}</Chip>
                </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-4">
                <div>
                  <p className="text-xs uppercase text-slate-400">ICP Fit</p>
                  <div className="mt-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-slate-900 dark:bg-slate-100" style={{ width: `${prospect.icpFit}%` }} />
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Owner</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{prospect.owner ?? 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Signals</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {companySignals[prospect.homeBusinessId]?.find(signal => signal.kind === 'press')?.title ?? 'No recent press'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Updated</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{new Date(prospect.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => router.push(`/prospects/${prospect.id}`)}>
                    Open
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => router.push(`/people?prospect=${prospect.id}`)} className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" /> Add Contact
                  </Button>
                  <PlaybookRunButton
                    status={playbookRuns[prospect.id] ?? 'idle'}
                    onRun={() => handleRunPlaybook(prospect)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <AddProspectDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onCreate={handleCreateProspect}
        homeBusinessId={activeHomeBusinessId}
        existingProspects={homeProspects}
        onOpenProspect={id => {
          setIsDrawerOpen(false);
          router.push(`/prospects/${id}`);
        }}
      />

      {activityLog.length ? (
        <Section title="Recent playbook activity" description="Lightweight log of queued playbook runs.">
          <div className="space-y-2 text-sm">
            {activityLog.map(entry => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-2 dark:border-slate-700 dark:bg-slate-900/40"
              >
                <p className="text-slate-600 dark:text-slate-300">{entry.message}</p>
                <span className="text-xs text-slate-400 dark:text-slate-500">{new Date(entry.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </Section>
      ) : null}
    </WorkspaceLayout>
  );
}

interface PlaybookRunButtonProps {
  status: 'idle' | 'running' | 'success';
  onRun: () => void;
}

function PlaybookRunButton({ status, onRun }: PlaybookRunButtonProps) {
  const isRunning = status === 'running';
  const isSuccess = status === 'success';

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        className="flex items-center gap-2"
        disabled={isRunning}
        onClick={onRun}
      >
        <Play className="h-4 w-4" />
        {isRunning ? 'Queuing…' : isSuccess ? 'Playbook ready' : 'Run Playbook'}
      </Button>
      {isSuccess ? (
        <Chip variant="success" className="flex items-center gap-1 text-[11px]">
          <CheckCircle2 className="h-3 w-3" />
          Success
        </Chip>
      ) : null}
    </div>
  );
}
