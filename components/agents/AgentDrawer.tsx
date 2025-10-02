"use client";

import { useEffect, useMemo, useState } from 'react';
import { AgentBadge } from '@/components/agents/AgentBadge';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { AGENTS } from '@/lib/agents';
import { useCreoStore } from '@/lib/store';

interface AgentDrawerProps {
  agentId: string | null;
  open: boolean;
  onClose: () => void;
}

export function AgentDrawer({ agentId, open, onClose }: AgentDrawerProps) {
  const agent = useMemo(() => AGENTS.find(item => item.id === agentId), [agentId]);
  const { businesses } = useCreoStore();
  const [notesByAgent, setNotesByAgent] = useState<Record<string, string[]>>({});
  const [draftNote, setDraftNote] = useState('');
  const [showAssignments, setShowAssignments] = useState(false);
  const [selection, setSelection] = useState<string[]>([]);

  useEffect(() => {
    if (!agent || !open) return;
    setSelection(businesses.filter(b => b.aiAgentIds.includes(agent.id)).map(b => b.id));
    setDraftNote('');
    setShowAssignments(false);
  }, [agent, open, businesses]);

  if (!open || !agent) {
    return null;
  }

  const notes = notesByAgent[agent.id] ?? [];

  const toggleBusiness = (businessId: string) => {
    setSelection(prev => (prev.includes(businessId) ? prev.filter(id => id !== businessId) : [...prev, businessId]));
  };

  const saveNote = () => {
    const value = draftNote.trim();
    if (!value) return;
    setNotesByAgent(prev => ({ ...prev, [agent.id]: [value, ...(prev[agent.id] ?? [])] }));
    setDraftNote('');
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="flex-1 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="flex h-full w-full max-w-sm flex-col bg-white shadow-xl dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div className="space-y-2">
            <AgentBadge agent={agent} />
            <Chip variant="info" className="text-[10px]">{agent.kind === 'human' ? 'Human operator' : 'AI agent'}</Chip>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close agent drawer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6 text-sm">
          <section className="space-y-3">
            <p className="text-xs uppercase tracking-wide text-slate-400">Role</p>
            <p className="font-medium text-slate-700 dark:text-slate-200">{agent.role}</p>
            <p className="text-slate-600 dark:text-slate-300">{agent.blurb}</p>
          </section>

          <section className="space-y-3">
            <p className="text-xs uppercase tracking-wide text-slate-400">Quick actions</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => alert(`${agent.name} console coming soon.`)}>
                Open Console
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAssignments(prev => !prev)}>
                Assign to Business
              </Button>
              <Button size="sm" variant="outline" onClick={saveNote} disabled={!draftNote.trim()}>
                Save Note
              </Button>
            </div>
            <textarea
              rows={3}
              value={draftNote}
              onChange={event => setDraftNote(event.target.value)}
              placeholder="Leave an internal note"
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
            {notes.length ? (
              <div className="space-y-2">
                {notes.map((note, index) => (
                  <p key={`${agent.id}-note-${index}`} className="rounded-2xl bg-slate-100/80 px-3 py-2 text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
                    {note}
                  </p>
                ))}
              </div>
            ) : null}
          </section>

          {showAssignments ? (
            <section className="space-y-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">Assign to businesses</p>
              <div className="space-y-2">
                {businesses.map(business => {
                  const checked = selection.includes(business.id);
                  return (
                    <label
                      key={`${agent.id}-${business.id}`}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/40"
                    >
                      <div>
                        <p className="font-medium text-slate-700 dark:text-slate-200">{business.name}</p>
                        <p className="text-xs text-slate-400">{business.industry}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleBusiness(business.id)}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 dark:border-slate-600 dark:text-slate-100"
                      />
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Selections are local only for now.</p>
            </section>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
