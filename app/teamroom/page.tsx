"use client";

import { useMemo, useState } from 'react';
import { WorkspaceLayout } from '@/components/WorkspaceLayout';
import { Section } from '@/components/Section';
import { AgentBadge } from '@/components/agents/AgentBadge';
import { Chip } from '@/components/Chip';
import { AGENTS } from '@/lib/agents';

const STATUS_OPTIONS = [
  { value: 'online', label: 'Online', variant: 'success' as const },
  { value: 'focus', label: 'Focus', variant: 'info' as const },
  { value: 'paused', label: 'Paused', variant: 'warning' as const },
];

const HUMAN_IDS = ['katie-elliott', 'ezra-elliott'];

export default function TeamroomPage() {
  const humans = useMemo(() => AGENTS.filter(agent => HUMAN_IDS.includes(agent.id)), []);
  const aiCrew = useMemo(() => AGENTS.filter(agent => agent.kind === 'ai'), []);
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<Record<string, typeof STATUS_OPTIONS[number]['value']>>({});

  const filteredCrew = useMemo(() => {
    if (!search.trim()) return aiCrew;
    const query = search.toLowerCase();
    return aiCrew.filter(agent => agent.name.toLowerCase().includes(query) || agent.role.toLowerCase().includes(query));
  }, [aiCrew, search]);

  return (
    <WorkspaceLayout>
      <Section title="Teamroom" description="Pin franchise leaders and manage your Creo AI crew.">
        <div className="grid gap-6">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Leadership</h2>
            <div className="flex flex-wrap gap-4">
              {humans.map(human => (
                <div key={human.id} className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                  <AgentBadge agent={human} />
                  <p className="text-xs text-slate-500 dark:text-slate-400">{human.role}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-500 dark:text-slate-400">Search crew</label>
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search by name or role"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">AI Crew</h3>
            {filteredCrew.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <p className="font-medium text-slate-600 dark:text-slate-300">No teammates match your query.</p>
                <p className="mt-1 text-xs">Try adjusting the name or role filter.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCrew.map(agent => {
                  const status = statuses[agent.id] ?? 'online';
                  const statusMeta = STATUS_OPTIONS.find(item => item.value === status) ?? STATUS_OPTIONS[0];
                  return (
                    <div key={agent.id} className="rounded-3xl border border-slate-200 bg-white/80 p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                      <div className="flex items-center justify-between gap-3">
                        <AgentBadge agent={agent} />
                        <Chip variant={statusMeta.variant}>{statusMeta.label}</Chip>
                      </div>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{agent.role}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <label className="text-xs text-slate-400">Status</label>
                        <select
                          value={status}
                          onChange={event => setStatuses(prev => ({ ...prev, [agent.id]: event.target.value as typeof status }))}
                          className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                          {STATUS_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Section>
    </WorkspaceLayout>
  );
}
