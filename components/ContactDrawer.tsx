"use client";

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { X, Sparkles, Edit3, Trash2, Flame, Zap, Clock3, Info, Plus } from 'lucide-react';
import type { ContactRecord } from '@/lib/mockData';
import { useCreoStore } from '@/lib/store';
import { freshness, freshnessColor } from '@/lib/mock';
import type { ContactMemory, MemoryFact, TimelineEvent } from '@/lib/types';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { StatusDot } from '@/components/StatusDot';
import { ChipInput } from '@/components/ChipInput';
import { cn } from '@/lib/utils';
import { AGENTS, getAvatar, type Agent } from '@/lib/agents';
import { formatRelative } from '@/lib/time';

type DrawerTab = 'Profile' | 'Memory' | 'Timeline';

interface ContactDrawerProps {
  contact: ContactRecord;
  isOpen: boolean;
  onClose: () => void;
}

const TABS: DrawerTab[] = ['Profile', 'Memory', 'Timeline'];

interface FactRowProps {
  fact: MemoryFact;
  onToggle: (next: boolean) => void;
  onEdit: (patch: Partial<Omit<MemoryFact, 'id'>>) => void;
  onDelete: () => void;
}

function FactRow({ fact, onToggle, onEdit, onDelete }: FactRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    label: fact.label,
    status: fact.status,
    confidence: fact.confidence,
    snippet: fact.snippet ?? '',
  });

  const attributionAgent = useMemo(() => selectAgentForFact(fact), [fact.id, fact.key, fact.label, fact.snippet]);
  const relativeTime = useMemo(() => formatRelative(fact.lastSeenAt), [fact.lastSeenAt]);

  useEffect(() => {
    setForm({
      label: fact.label,
      status: fact.status,
      confidence: fact.confidence,
      snippet: fact.snippet ?? '',
    });
    setIsEditing(false);
  }, [fact.confidence, fact.id, fact.label, fact.snippet, fact.status]);

  const freshnessLabel = freshness(fact.lastSeenAt);

  const statusIcon = fact.status === 'positive' ? '✅' : fact.status === 'negative' ? '❌' : 'ℹ️';

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_100px_120px_90px_90px_80px] items-start gap-3 rounded-2xl border border-slate-200 bg-white/70 p-3 text-xs dark:border-slate-700 dark:bg-slate-900/50">
      <div className="space-y-1">
        {isEditing ? (
          <textarea
            value={form.label}
            onChange={event => setForm(prev => ({ ...prev, label: event.target.value }))}
            rows={2}
            className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900"
          />
        ) : (
          <p className="font-medium text-slate-800 dark:text-slate-100">{fact.label}</p>
        )}
        {isEditing ? (
          <textarea
            value={form.snippet}
            onChange={event => setForm(prev => ({ ...prev, snippet: event.target.value }))}
            rows={2}
            placeholder="Snippet"
            className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900"
          />
        ) : fact.snippet ? (
          <p className="text-slate-500 dark:text-slate-400">{fact.snippet}</p>
        ) : null}
        {!isEditing ? (
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
              {renderAgentGlyph(attributionAgent)}
              <span>Learned by {attributionAgent.name}</span>
            </span>
            <span>· {relativeTime}</span>
          </div>
        ) : null}
      </div>
      <div className="flex items-center gap-1">
        <span>{statusIcon}</span>
        <span className="capitalize text-slate-600 dark:text-slate-300">{fact.status}</span>
      </div>
      <div>
        {isEditing ? (
          <select
            value={form.status}
            onChange={event => setForm(prev => ({ ...prev, status: event.target.value as MemoryFact['status'] }))}
            className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
            <option value="neutral">Neutral</option>
          </select>
        ) : (
          <div className="space-y-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-slate-900 dark:bg-slate-100"
                style={{ width: `${Math.round(fact.confidence * 100)}%` }}
              />
            </div>
            <span className="text-slate-500 dark:text-slate-400">{Math.round(fact.confidence * 100)}%</span>
          </div>
        )}
      </div>
      <div className="flex items-center">
        <Chip className={cn('px-2 py-0.5 text-[10px] font-semibold', freshnessColor(freshnessLabel))}>
          {freshnessLabel}
        </Chip>
      </div>
      <div className="space-y-1">
        <span className="capitalize text-slate-600 dark:text-slate-300">{fact.source}</span>
        <span className="text-slate-400">{new Date(fact.lastSeenAt).toLocaleDateString()}</span>
      </div>
      <div className="flex flex-col items-start gap-2">
        <label className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-300">
          <input
            type="checkbox"
            checked={fact.useInPersonalization}
            onChange={event => onToggle(event.target.checked)}
            className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-500 dark:border-slate-600 dark:text-slate-100"
          />
          Use
        </label>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onEdit({
                    label: form.label,
                    status: form.status,
                    confidence: Math.max(0, Math.min(1, form.confidence)),
                    snippet: form.snippet,
                  });
                  setIsEditing(false);
                }}
                className="px-2 text-[11px]"
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="px-2 text-[11px]"
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="text-slate-400 transition hover:text-rose-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
        {freshnessLabel === 'Cold' ? (
          <p className="text-[10px] text-amber-600 dark:text-amber-300">Older than 60d — confirm before using.</p>
        ) : null}
      </div>
    </div>
  );
}

const FACT_AGENT_RULES: Array<{ pattern: RegExp; agentId: string }> = [
  { pattern: /pricing|quote|contract/i, agentId: 'leo' },
  { pattern: /pricing|cost|budget/i, agentId: 'eden' },
  { pattern: /copy|narrative|story|content/i, agentId: 'story' },
  { pattern: /outreach|email|follow/i, agentId: 'piper' },
  { pattern: /prospect|scout|discovery/i, agentId: 'scout' },
];

function selectAgentForFact(fact: MemoryFact): Agent {
  for (const rule of FACT_AGENT_RULES) {
    if (rule.pattern.test(fact.label) || rule.pattern.test(fact.key) || (fact.snippet && rule.pattern.test(fact.snippet))) {
      const match = AGENTS.find(agent => agent.id === rule.agentId);
      if (match) return match;
    }
  }
  const index = Math.abs(hashString(fact.id)) % AGENTS.length;
  return AGENTS[index];
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function renderAgentGlyph(agent: Agent) {
  if (agent.kind === 'human') {
    return <Image src={getAvatar(agent)} alt={agent.name} width={16} height={16} className="h-4 w-4 rounded-full object-cover" />;
  }
  return <span className="text-base">{agent.emoji}</span>;
}

interface PromoteDialogProps {
  event: TimelineEvent;
  onSubmit: (payload: { status: MemoryFact['status']; confidence: number; label: string }) => void;
  onCancel: () => void;
}

function PromoteDialog({ event, onSubmit, onCancel }: PromoteDialogProps) {
  const [form, setForm] = useState({
    status: 'positive' as MemoryFact['status'],
    confidence: 0.75,
    label: event.title,
  });

  useEffect(() => {
    setForm({ status: 'positive', confidence: 0.75, label: event.title });
  }, [event.id, event.title]);

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h4 className="font-semibold text-slate-800 dark:text-slate-100">Promote to fact</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400">Hot items default to personalisation on; adjust as needed.</p>
      <label className="block space-y-1 text-xs">
        <span className="text-slate-600 dark:text-slate-300">Fact label</span>
        <input
          value={form.label}
          onChange={event => setForm(prev => ({ ...prev, label: event.target.value }))}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-xs">
          <span className="text-slate-600 dark:text-slate-300">Status</span>
          <select
            value={form.status}
            onChange={event => setForm(prev => ({ ...prev, status: event.target.value as MemoryFact['status'] }))}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
        </label>
        <label className="space-y-1 text-xs">
          <span className="text-slate-600 dark:text-slate-300">Confidence (0-1)</span>
          <input
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={form.confidence}
            onChange={event => setForm(prev => ({ ...prev, confidence: Number(event.target.value) }))}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={() => onSubmit({
            status: form.status,
            confidence: Math.max(0, Math.min(1, form.confidence)),
            label: form.label,
          })}
        >
          Promote
        </Button>
      </div>
    </div>
  );
}

export function ContactDrawer({ contact, isOpen, onClose }: ContactDrawerProps) {
  const {
    memories,
    contactTimelines,
    saveProfileTraits,
    toggleFactUse,
    editFact,
    deleteFact,
    regenerateSummary,
    promoteEventToFact,
    prospects,
    people,
    movePersonToProspect,
  } = useCreoStore();

  const [activeTab, setActiveTab] = useState<DrawerTab>('Profile');
  const [editing, setEditing] = useState(false);
  const [traitsDraft, setTraitsDraft] = useState<ContactMemory['traits'] | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<TimelineEvent | null>(null);

  const memory = memories[contact.id];
  const timeline = contactTimelines[contact.id] ?? [];
  const person = people.find(item => item.id === contact.id);
  const availableProspects = person
    ? prospects.filter(item => item.homeBusinessId === person.homeBusinessId)
    : [];

  useEffect(() => {
    if (isOpen) {
      setActiveTab('Profile');
      setEditing(false);
      if (memory) {
        setTraitsDraft(memory.traits);
      }
    }
  }, [isOpen, contact.id, memory]);

  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handle);
    } else {
      document.removeEventListener('keydown', handle);
    }
    return () => document.removeEventListener('keydown', handle);
  }, [isOpen, onClose]);

  if (!isOpen || !memory) {
    return null;
  }

  const highlights = memory.facts.slice(0, 3);

  const handleSaveTraits = () => {
    if (traitsDraft) {
      saveProfileTraits(contact.id, traitsDraft);
      setEditing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 bg-slate-900/40 backdrop-blur" onClick={onClose} />
      <aside className="flex h-full w-full max-w-xl flex-col bg-white shadow-xl dark:bg-slate-900">
        <header className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{contact.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {contact.role} · {contact.company}
              </p>
            </div>
            <button
              aria-label="Close contact drawer"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <StatusDot status="info" />
              Stage: {contact.stage}
            </div>
            {activeTab === 'Profile' ? (
              editing ? (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveTraits}>
                    Save
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                  Edit profile
                </Button>
              )
            ) : null}
          </div>
          {person ? (
            <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span>Prospect Business</span>
              <select
                value={person.prospectBusinessId}
                onChange={event => {
                  const next = event.target.value;
                  if (next === person.prospectBusinessId) return;
                  const confirmMove = window.confirm('Move this contact to the selected prospect?');
                  if (confirmMove) {
                    movePersonToProspect(person.id, next);
                  } else {
                    event.target.value = person.prospectBusinessId;
                  }
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                {availableProspects.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <nav className="mt-4 flex gap-2">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPromoteTarget(null);
                }}
                className={cn(
                  'rounded-xl px-4 py-2 text-sm font-medium',
                  activeTab === tab ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                )}
              >
                {tab}
              </button>
            ))}
          </nav>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {activeTab === 'Profile' && traitsDraft ? (
            <div className="space-y-4">
              <ChipInput
                label="Interests"
                values={traitsDraft.interests}
                placeholder="Add interest and press Enter"
                onChange={values => setTraitsDraft(prev => prev && { ...prev, interests: values })}
              />
              <ChipInput
                label="Pains"
                values={traitsDraft.pains}
                placeholder="Add pain point"
                onChange={values => setTraitsDraft(prev => prev && { ...prev, pains: values })}
              />
              <ChipInput
                label="Goals"
                values={traitsDraft.goals}
                placeholder="Add goal"
                onChange={values => setTraitsDraft(prev => prev && { ...prev, goals: values })}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="text-slate-600 dark:text-slate-300">Tone preference</span>
                  <select
                    value={traitsDraft.preferences.tone ?? ''}
                    onChange={event =>
                      setTraitsDraft(prev =>
                        prev && {
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            tone: event.target.value as ContactMemory['traits']['preferences']['tone'],
                          },
                        }
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <option value="">Select tone</option>
                    <option value="Warm">Warm</option>
                    <option value="Direct">Direct</option>
                    <option value="Playful">Playful</option>
                  </select>
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-slate-600 dark:text-slate-300">Cadence (days)</span>
                  <input
                    type="number"
                    min={1}
                    value={traitsDraft.preferences.cadenceDays ?? ''}
                    onChange={event =>
                      setTraitsDraft(prev =>
                        prev && {
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            cadenceDays: event.target.value ? Number(event.target.value) : undefined,
                          },
                        }
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-slate-600 dark:text-slate-300">Preferred channel</span>
                  <select
                    value={traitsDraft.preferences.channel ?? ''}
                    onChange={event =>
                      setTraitsDraft(prev =>
                        prev && {
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            channel: event.target.value as ContactMemory['traits']['preferences']['channel'],
                          },
                        }
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <option value="">Select channel</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="sms">SMS</option>
                  </select>
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-slate-600 dark:text-slate-300">Price sensitivity</span>
                  <select
                    value={traitsDraft.preferences.priceSensitivity ?? ''}
                    onChange={event =>
                      setTraitsDraft(prev =>
                        prev && {
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            priceSensitivity: event.target.value as ContactMemory['traits']['preferences']['priceSensitivity'],
                          },
                        }
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <option value="">Select</option>
                    <option value="Low">Low</option>
                    <option value="Med">Med</option>
                    <option value="High">High</option>
                  </select>
                </label>
              </div>
            </div>
          ) : null}

          {activeTab === 'Memory' ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-100/70 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
                Facts include source, date, and confidence. Toggle whether each fact is used in personalization.
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Highlights</h3>
                  <Button size="sm" variant="outline" onClick={() => regenerateSummary(contact.id)} className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    Regenerate summary
                  </Button>
                </div>
                <p className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                  {memory.summary}
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {highlights.map(fact => (
                    <div
                      key={fact.id}
                      className="rounded-2xl border border-slate-200 bg-white/80 p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
                    >
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{fact.label}</p>
                      <div className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold capitalize text-slate-600 dark:text-slate-200">
                        <span className={cn('rounded-full px-2 py-0.5', freshnessColor(freshness(fact.lastSeenAt)))}>
                          {freshness(fact.lastSeenAt)}
                        </span>
                        · {Math.round(fact.confidence * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Info className="h-3.5 w-3.5" />
                  Cold facts display a reminder to confirm before use.
                </div>
                <div className="space-y-3">
                  {memory.facts.map(fact => (
                    <FactRow
                      key={fact.id}
                      fact={fact}
                      onToggle={next => toggleFactUse(contact.id, fact.id, next)}
                      onEdit={patch => editFact(contact.id, fact.id, patch)}
                      onDelete={() => deleteFact(contact.id, fact.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === 'Timeline' ? (
            <div className="space-y-4">
              {timeline.map(event => {
                const label = freshness(event.occurredAt);
                const Icon = event.kind === 'email' ? Flame : event.kind === 'social' ? Zap : event.kind === 'press' ? Info : Clock3;
                return (
                  <div key={event.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm dark:border-slate-700 dark:bg-slate-900/50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-slate-500" />
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{event.title}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{event.snippet}</p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <span>{event.source}</span>
                          <span>·</span>
                          <span>{new Date(event.occurredAt).toLocaleString()}</span>
                          <span>·</span>
                          <span className={cn('rounded-full px-2 py-0.5 font-semibold', freshnessColor(label))}>{label}</span>
                        </div>
                      </div>
                      {event.promoteable ? (
                        <Button size="sm" variant="outline" className="flex items-center gap-2" onClick={() => setPromoteTarget(event)}>
                          <Plus className="h-3.5 w-3.5" />
                          Promote to fact
                        </Button>
                      ) : (
                        <Chip className="text-[10px]">Promoted</Chip>
                      )}
                    </div>
                    {promoteTarget?.id === event.id ? (
                      <PromoteDialog
                        event={event}
                        onCancel={() => setPromoteTarget(null)}
                        onSubmit={({ status, confidence, label: factLabel }) => {
                          promoteEventToFact(contact.id, { event, status, confidence, label: factLabel });
                          setPromoteTarget(null);
                        }}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
