"use client";

import { useEffect, useMemo, useState } from 'react';
import { Modal, ModalFooter } from '@/components/Modal';
import { ChipInput } from '@/components/ChipInput';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import type { Priority, ProspectBusiness, ProspectStage } from '@/lib/types';

interface ProspectForm {
  name: string;
  website: string;
  industry: string;
  size: string;
  region: string;
  segment: string;
  icpFit: number;
  priority: Priority;
  stage: ProspectStage;
  tags: string[];
  owner: string;
  source: 'Discovery' | 'Import' | 'Manual';
}

const DEFAULT_FORM: ProspectForm = {
  name: '',
  website: '',
  industry: '',
  size: '',
  region: '',
  segment: '',
  icpFit: 70,
  priority: 'P2',
  stage: 'Discovered',
  tags: [],
  owner: '',
  source: 'Manual',
};

interface AddProspectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (prospect: ProspectBusiness) => void;
  homeBusinessId: string;
  existingProspects: ProspectBusiness[];
  onOpenProspect?: (id: string) => void;
}

export function AddProspectDrawer({ isOpen, onClose, onCreate, homeBusinessId, existingProspects, onOpenProspect }: AddProspectDrawerProps) {
  const [form, setForm] = useState<ProspectForm>(DEFAULT_FORM);

  useEffect(() => {
    if (!isOpen) {
      setForm(DEFAULT_FORM);
    }
  }, [isOpen]);

  const duplicate = useMemo(() => {
    if (!form.name.trim() || !form.website.trim()) return undefined;
    return existingProspects.find(
      prospect =>
        prospect.homeBusinessId === homeBusinessId &&
        prospect.name.toLowerCase() === form.name.trim().toLowerCase() &&
        prospect.website?.toLowerCase() === form.website.trim().toLowerCase(),
    );
  }, [existingProspects, form.name, form.website, homeBusinessId]);

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const now = new Date().toISOString();
    onCreate({
      id: `prospect-${Date.now()}`,
      homeBusinessId,
      name: form.name.trim(),
      website: form.website.trim() || undefined,
      industry: form.industry.trim() || undefined,
      size: form.size.trim() || undefined,
      region: form.region.trim() || undefined,
      segment: form.segment.trim() || undefined,
      source: form.source,
      owner: form.owner.trim() || undefined,
      icpFit: form.icpFit,
      priority: form.priority,
      stage: form.stage,
      tags: form.tags,
      updatedAt: now,
    });
    setForm(DEFAULT_FORM);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Prospect Business"
      description="Capture core firmographics so Creo AI can orchestrate outreach and buying committees."
      className="max-w-4xl"
    >
      {duplicate ? (
        <div className="rounded-2xl border border-amber-400/60 bg-amber-100/60 p-4 text-sm text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-200">
          This looks similar to <button className="underline" onClick={() => onOpenProspect?.(duplicate.id)}>{duplicate.name}</button>. Open instead or save to create anyway.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="text-slate-600 dark:text-slate-300">Name *</span>
          <input
            value={form.name}
            onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-slate-600 dark:text-slate-300">Website</span>
          <input
            value={form.website}
            onChange={event => setForm(prev => ({ ...prev, website: event.target.value }))}
            placeholder="https://"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-slate-600 dark:text-slate-300">Industry</span>
          <input
            value={form.industry}
            onChange={event => setForm(prev => ({ ...prev, industry: event.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-slate-600 dark:text-slate-300">Size</span>
          <input
            value={form.size}
            onChange={event => setForm(prev => ({ ...prev, size: event.target.value }))}
            placeholder="10-50"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-slate-600 dark:text-slate-300">Region</span>
          <input
            value={form.region}
            onChange={event => setForm(prev => ({ ...prev, region: event.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-slate-600 dark:text-slate-300">Segment</span>
          <input
            value={form.segment}
            onChange={event => setForm(prev => ({ ...prev, segment: event.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="text-slate-600 dark:text-slate-300">ICP Fit: {form.icpFit}</span>
          <input
            type="range"
            min={0}
            max={100}
            value={form.icpFit}
            onChange={event => setForm(prev => ({ ...prev, icpFit: Number(event.target.value) }))}
            className="w-full"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-600 dark:text-slate-300">Owner</span>
          <input
            value={form.owner}
            onChange={event => setForm(prev => ({ ...prev, owner: event.target.value }))}
            placeholder="Scout, Story..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2 text-sm">
          <span className="text-slate-600 dark:text-slate-300">Priority</span>
          <div className="flex gap-2">
            {(['P1', 'P2', 'P3'] as Priority[]).map(priority => (
              <button
                key={priority}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, priority }))}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm transition ${
                  form.priority === priority
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                }`}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>
        <label className="space-y-2 text-sm">
          <span className="text-slate-600 dark:text-slate-300">Stage</span>
          <select
            value={form.stage}
            onChange={event => setForm(prev => ({ ...prev, stage: event.target.value as ProspectStage }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {['Discovered', 'Qualified', 'Pursuing', 'Proposal', 'Won', 'Lost'].map(stage => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-slate-600 dark:text-slate-300">Source</span>
          <select
            value={form.source}
            onChange={event => setForm(prev => ({ ...prev, source: event.target.value as ProspectBusiness['source'] }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="Discovery">Discovery</option>
            <option value="Import">Import</option>
            <option value="Manual">Manual</option>
          </select>
        </label>
      </div>

      <ChipInput
        label="Tags"
        values={form.tags}
        placeholder="Add initiative and press Enter"
        onChange={tags => setForm(prev => ({ ...prev, tags }))}
      />

      <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
        {form.tags.map(tag => (
          <Chip key={tag} className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {tag}
          </Chip>
        ))}
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!form.name.trim()}>
          Save Prospect
        </Button>
      </ModalFooter>
    </Modal>
  );
}
