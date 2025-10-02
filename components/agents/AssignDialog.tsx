"use client";

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { AGENTS, type Agent } from '@/lib/agents';

interface AssignDialogProps {
  open: boolean;
  onClose: () => void;
  assigned: string[];
  onChange: (ids: string[]) => void;
}

export function AssignDialog({ open, onClose, assigned, onChange }: AssignDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [selection, setSelection] = useState<string[]>(assigned);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) {
      setSelection(assigned);
    }
  }, [open, assigned]);

  const { humans, ai } = useMemo(() => {
    const humans: Agent[] = [];
    const ai: Agent[] = [];
    AGENTS.forEach(agent => (agent.kind === 'human' ? humans : ai).push(agent));
    return { humans, ai };
  }, []);

  const toggle = (id: string) => {
    setSelection(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  };

  const handleApply = () => {
    onChange(selection);
    onClose();
  };

  if (!open || !mounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Assign Team</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Choose who supports this business day-to-day.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close assign team dialog"
          >
            ✕
          </button>
        </header>

        <div className="mt-6 space-y-6">
          <SectionGroup title="Franchise leaders" agents={humans} selection={selection} onToggle={toggle} />
          <SectionGroup title="AI specialists" agents={ai} selection={selection} onToggle={toggle} />
          {humans.length + ai.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              All set—no additional teammates to assign.
            </div>
          ) : null}
        </div>

        <footer className="mt-6 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </footer>
      </div>
    </div>
  );
}
function SectionGroup({
  title,
  agents,
  selection,
  onToggle,
}: {
  title: string;
  agents: Agent[];
  selection: string[];
  onToggle: (id: string) => void;
}) {
  if (!agents.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</h3>
        <Chip variant="neutral">{agents.length}</Chip>
      </div>
      <div className="space-y-2">
        {agents.map(agent => {
          const checked = selection.includes(agent.id);
          return (
            <label
              key={agent.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/40"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{agent.kind === 'human' ? '👤' : agent.emoji}</span>
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{agent.name}</p>
                  <p className="text-xs text-slate-400">{agent.role}</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(agent.id)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 dark:border-slate-600 dark:text-slate-100"
              />
            </label>
          );
        })}
      </div>
    </section>
  );
}
