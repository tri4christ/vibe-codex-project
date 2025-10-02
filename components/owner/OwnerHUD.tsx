"use client";

import { useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';

interface OwnerHUDProps {
  open: boolean;
  onClose: () => void;
}

type ApprovalStatus = 'pending' | 'approved' | 'declined';
type CreativeStatus = 'pending' | 'approved' | 'changes';

const APPROVAL_ITEMS = [
  { id: 'outreach', label: 'Outreach thread – Piper', hint: 'AI-drafted follow-up awaiting sign-off.' },
  { id: 'pricing', label: 'Pricing update – Eden', hint: 'Tiered proposal for Summit Ridge.' },
  { id: 'contract', label: 'Contract packet – Leo', hint: 'Template with revised terms.' },
];

const CREATIVE_ITEMS = [
  { id: 'draft-hero', label: 'Hero banner copy', owner: 'Ezra Elliott' },
  { id: 'draft-email', label: 'Onboarding email sequence', owner: 'Ezra Elliott' },
  { id: 'draft-social', label: 'Launch social carousel', owner: 'Ezra Elliott' },
];

export function OwnerHUD({ open, onClose }: OwnerHUDProps) {
  const [activeTab, setActiveTab] = useState<'approvals' | 'creative'>('approvals');
  const [approvals, setApprovals] = useState<Record<string, ApprovalStatus>>({});
  const [creative, setCreative] = useState<Record<string, CreativeStatus>>({});

  const counts = useMemo(() => ({
    approvals: APPROVAL_ITEMS.filter(item => (approvals[item.id] ?? 'pending') === 'pending').length,
    creative: CREATIVE_ITEMS.filter(item => (creative[item.id] ?? 'pending') === 'pending').length,
  }), [approvals, creative]);

  if (!open) {
    return null;
  }

  return (
    <div className="absolute right-6 top-20 z-50 w-80 rounded-3xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Owner HUD</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Katie reviews approvals; Ezra owns creative.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Close owner HUD"
        >
          ✕
        </button>
      </header>

      <nav className="mt-4 flex gap-2 text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('approvals')}
          className={`flex-1 rounded-full px-3 py-2 ${
            activeTab === 'approvals'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          Approvals
          {counts.approvals ? (
            <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] text-slate-700 dark:bg-slate-900 dark:text-slate-200">
              {counts.approvals}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('creative')}
          className={`flex-1 rounded-full px-3 py-2 ${
            activeTab === 'creative'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          Creative
          {counts.creative ? (
            <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] text-slate-700 dark:bg-slate-900 dark:text-slate-200">
              {counts.creative}
            </span>
          ) : null}
        </button>
      </nav>

      {activeTab === 'approvals' ? (
        <ApprovalsView
          items={APPROVAL_ITEMS}
          statuses={approvals}
          onUpdate={(id, status) => setApprovals(prev => ({ ...prev, [id]: status }))}
        />
      ) : (
        <CreativeView
          items={CREATIVE_ITEMS}
          statuses={creative}
          onUpdate={(id, status) => setCreative(prev => ({ ...prev, [id]: status }))}
        />
      )}
    </div>
  );
}

function ApprovalsView({
  items,
  statuses,
  onUpdate,
}: {
  items: typeof APPROVAL_ITEMS;
  statuses: Record<string, ApprovalStatus>;
  onUpdate: (id: string, status: ApprovalStatus) => void;
}) {
  return (
    <div className="mt-4 space-y-3 text-sm">
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Nothing waiting for Katie right now.
        </div>
      ) : null}
      {items.map(item => {
        const status = statuses[item.id] ?? 'pending';
        const chipVariant = status === 'approved' ? 'success' : status === 'declined' ? 'warning' : 'neutral';
        const chipLabel = status === 'approved' ? 'Approved' : status === 'declined' ? 'Declined' : 'Awaiting Katie';
        return (
          <div key={item.id} className="rounded-2xl border border-slate-200 bg-white/80 p-3 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-200">{item.label}</p>
                <p className="text-xs text-slate-400">{item.hint}</p>
              </div>
              <Chip variant={chipVariant}>{chipLabel}</Chip>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <label className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={status === 'approved'}
                  onChange={event => onUpdate(item.id, event.target.checked ? 'approved' : 'pending')}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 dark:border-slate-600 dark:text-slate-100"
                />
                Approve automatically next time
              </label>
              <div className="ml-auto flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onUpdate(item.id, 'declined')}>
                  Decline
                </Button>
                <Button size="sm" onClick={() => onUpdate(item.id, 'approved')}>
                  Approve
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CreativeView({
  items,
  statuses,
  onUpdate,
}: {
  items: typeof CREATIVE_ITEMS;
  statuses: Record<string, CreativeStatus>;
  onUpdate: (id: string, status: CreativeStatus) => void;
}) {
  return (
    <div className="mt-4 space-y-3 text-sm">
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Creative queue is clear for Ezra.
        </div>
      ) : null}
      {items.map(item => {
        const status = statuses[item.id] ?? 'pending';
        const chipVariant = status === 'approved' ? 'success' : status === 'changes' ? 'warning' : 'neutral';
        const chipLabel = status === 'approved' ? 'Approved by Ezra' : status === 'changes' ? 'Feedback requested' : 'Awaiting Ezra';
        return (
          <div key={item.id} className="rounded-2xl border border-slate-200 bg-white/80 p-3 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-200">{item.label}</p>
                <p className="text-xs text-slate-400">Owner: {item.owner}</p>
              </div>
              <Chip variant={chipVariant}>{chipLabel}</Chip>
            </div>
            <div className="mt-3 flex items-center justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => onUpdate(item.id, 'changes')}>
                Request changes
              </Button>
              <Button size="sm" onClick={() => onUpdate(item.id, 'approved')}>
                Approve
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
