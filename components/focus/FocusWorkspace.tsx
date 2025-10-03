"use client";

import { useEffect, useMemo, useState } from 'react';
import { WorkspaceLayout } from '@/components/WorkspaceLayout';
import { FocusKPIs } from '@/components/focus/FocusKPIs';
import { FocusList } from '@/components/focus/FocusList';
import { FocusMilestones } from '@/components/focus/FocusMilestones';
import { FocusDetails } from '@/components/focus/FocusDetails';
import { ChatThread } from '@/components/focus/ChatThread';
import { FocusInsightsSidebar } from '@/components/focus/FocusInsightsSidebar';
import { AskCrew } from '@/components/focus/AskCrew';
import { useCreoStore } from '@/lib/store';
import type { Focus, FocusStatus } from '@/lib/types';
import { Button } from '@/components/Button';
import { createFocus, getFocuses, updateFocus } from '@/lib/focusStore';
import { addAssistantResponse, addMessage, listMessages, type FocusMessage } from '@/lib/focusMessagesStore';

export function FocusWorkspace() {
  const { businesses, activeHomeBusinessId } = useCreoStore();
  const [focuses, setFocuses] = useState<Focus[]>(() => getFocuses());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<FocusStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [agentMessages, setAgentMessages] = useState<FocusMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFocuses(getFocuses());
  }, []);

  const filteredFocuses = useMemo(
    () => filterFocuses(focuses, statusFilter, searchQuery),
    [focuses, statusFilter, searchQuery],
  );

  useEffect(() => {
    if (filteredFocuses.length === 0) {
      if (!focuses.length) {
        setSelectedId(null);
        setAgentMessages([]);
      } else if (selectedId && !focuses.some(item => item.id === selectedId)) {
        setSelectedId(null);
        setAgentMessages([]);
      }
      return;
    }
    if (!selectedId || !filteredFocuses.some(item => item.id === selectedId)) {
      setSelectedId(filteredFocuses[0].id);
      setAgentMessages([]);
    }
  }, [filteredFocuses, focuses, selectedId]);

  const selectedFocus = useMemo(() => focuses.find(item => item.id === selectedId) ?? null, [focuses, selectedId]);

  function handleCreateFocus() {
    const businessId = activeHomeBusinessId ?? businesses[0]?.id;
    if (!businessId) {
      setError('No business selected to attach this focus.');
      return;
    }
    try {
      const created = createFocus({
        businessId,
        title: 'New Focus',
        description: '',
        tags: [],
        status: 'draft',
        kpis: [],
        milestones: [],
      });
      setFocuses(prev => sortByUpdated([created, ...prev]));
      setSelectedId(created.id);
      setAgentMessages([]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create focus');
    }
  }

  function handleUpdateFocus(patch: Partial<Focus>) {
    if (!selectedFocus) return;
    const updated = updateFocus(selectedFocus.id, patch);
    if (!updated) {
      setError('Unable to update focus');
      return;
    }
    setFocuses(prev => sortByUpdated(prev.map(item => (item.id === updated.id ? updated : item))));
    setError(null);
  }

  const focusId = selectedFocus?.id ?? null;

  useEffect(() => {
    if (!focusId) {
      setAgentMessages([]);
      return;
    }
    setAgentMessages(listMessages(focusId));
  }, [focusId]);

  function handleAskCrew(prompt: string) {
    if (!selectedFocus) return;
    const user = addMessage({ focusId: selectedFocus.id, role: 'user', text: prompt });
    const assistant = addAssistantResponse(selectedFocus.id, prompt);
    setAgentMessages(prev => [...prev, user, assistant]);
    setError(null);
  }

  return (
    <WorkspaceLayout>
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <FocusList
          focuses={focuses}
          visible={filteredFocuses}
          selectedId={selectedId}
          onSelect={id => {
            setSelectedId(id);
            setAgentMessages([]);
          }}
          onCreate={handleCreateFocus}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
        />
        <main className="order-1 space-y-6 lg:order-none lg:min-w-[720px]">
          {error ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </p>
          ) : null}
          {selectedFocus ? (
            <>
              <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                <AskCrew initialValue="" onSend={handleAskCrew} />
                <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
                  <ChatThread focus={selectedFocus} messages={agentMessages} />
                </div>
              </section>
              <FocusDetails focus={selectedFocus} onUpdate={handleUpdateFocus} />
              <div className="grid gap-6 lg:grid-cols-2">
                <FocusKPIs kpis={selectedFocus.kpis} onChange={kpis => handleUpdateFocus({ kpis })} />
                <FocusMilestones
                  milestones={selectedFocus.milestones}
                  onChange={milestones => handleUpdateFocus({ milestones })}
                />
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
              <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">Create your first focus</p>
              <p className="max-w-md text-sm">
                Align Leo and Eden around a single objective. Once you add a focus, the crew will orchestrate playbooks and surface KPIs here.
              </p>
              <Button onClick={handleCreateFocus}>New Focus</Button>
            </div>
          )}
        </main>
        <div className="order-2 space-y-6 lg:order-none">
          <FocusInsightsSidebar tags={selectedFocus?.tags ?? []} variant="inline" />
        </div>
      </div>
    </WorkspaceLayout>
  );
}

function filterFocuses(data: Focus[], status: FocusStatus | 'all', query: string): Focus[] {
  const normalizedQuery = query.trim().toLowerCase();
  return data.filter(item => {
    const matchesStatus = status === 'all' ? true : item.status === status;
    const matchesQuery = normalizedQuery
      ? item.title.toLowerCase().includes(normalizedQuery) || item.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))
      : true;
    return matchesStatus && matchesQuery;
  });
}

function sortByUpdated(data: Focus[]): Focus[] {
  return [...data].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}
