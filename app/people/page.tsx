"use client";

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { WorkspaceLayout } from '@/components/WorkspaceLayout';
import { Section } from '@/components/Section';
import { Chip } from '@/components/Chip';
import { Button } from '@/components/Button';
import { AddContactDrawer } from '@/components/AddContactDrawer';
import { ContactDrawer } from '@/components/ContactDrawer';
import { useCreoStore } from '@/lib/store';
import type { Person } from '@/lib/types';
import { Search } from 'lucide-react';

export default function PeoplePage() {
  const searchParams = useSearchParams();
  const preselectedProspect = searchParams?.get('prospect') ?? undefined;
  const {
    people,
    prospects,
    activeHomeBusinessId,
    memories,
  } = useCreoStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  const homePeople = useMemo(
    () => people.filter(person => person.homeBusinessId === activeHomeBusinessId),
    [people, activeHomeBusinessId],
  );

  const filteredPeople = useMemo(() => {
    return homePeople.filter(person => {
      if (stageFilter !== 'All' && person.stage !== stageFilter) return false;
      if (roleFilter !== 'All' && person.role !== roleFilter) return false;
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        person.name.toLowerCase().includes(query) ||
        (person.title ?? '').toLowerCase().includes(query) ||
        (person.email ?? '').toLowerCase().includes(query)
      );
    });
  }, [homePeople, searchQuery, stageFilter, roleFilter]);

  const selectedPerson = selectedPersonId ? people.find(person => person.id === selectedPersonId) ?? null : null;

  const stageMap: Record<string, 'Discovery' | 'Enriched' | 'Outreach' | 'Reply' | 'Contracted'> = {
    New: 'Discovery',
    Nurturing: 'Enriched',
    Qualified: 'Outreach',
    Meeting: 'Reply',
    Won: 'Contracted',
    Lost: 'Discovery',
  };

  return (
    <WorkspaceLayout>
      <Section
        title="People"
        description="All the humans Creo AI is orchestrating for this home business."
        actions={
          <Button onClick={() => setIsAddDrawerOpen(true)}>Add Contact</Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder="Search name, title, email"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
          </div>
          <select
            value={stageFilter}
            onChange={event => setStageFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="All">All stages</option>
            {['New', 'Nurturing', 'Qualified', 'Meeting', 'Won', 'Lost'].map(stage => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
          <select
            value={roleFilter}
            onChange={event => setRoleFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="All">All roles</option>
            {['Decision Maker', 'Economic Buyer', 'Technical Buyer', 'Champion', 'Influencer', 'Blocker'].map(role => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </Section>

      <Section>
        {filteredPeople.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No contacts yet—add one to brief Creo AI.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPeople.map(person => {
              const prospect = prospects.find(item => item.id === person.prospectBusinessId);
              return (
                <button
                  key={person.id}
                  onClick={() => setSelectedPersonId(person.id)}
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 p-4 text-left text-sm transition hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-slate-600"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{person.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{person.title ?? 'Role TBD'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{person.email}</p>
                    </div>
                    <Chip variant="info">{person.stage}</Chip>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>Role: {person.role ?? 'Unset'}</span>
                    <span>Prospect: {prospect?.name ?? 'Unlinked'}</span>
                    <span>Updated {new Date(person.updatedAt).toLocaleDateString()}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Section>

      <AddContactDrawer
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        defaultProspectId={preselectedProspect}
        homeBusinessId={activeHomeBusinessId}
      />

      {selectedPerson ? (
        <ContactDrawer
          contact={{
            id: selectedPerson.id,
            name: selectedPerson.name,
            role: selectedPerson.title ?? 'Prospect contact',
            company: prospects.find(item => item.id === selectedPerson.prospectBusinessId)?.name ?? 'Unknown',
            stage: stageMap[selectedPerson.stage] ?? 'Discovery',
            lastTouch: 'Recently',
          }}
          isOpen={!!selectedPerson}
          onClose={() => setSelectedPersonId(null)}
        />
      ) : null}
    </WorkspaceLayout>
  );
}
