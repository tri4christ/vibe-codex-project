"use client";

import { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WorkspaceLayout } from '@/components/WorkspaceLayout';
import { useCreoStore } from '@/lib/store';
import { Section } from '@/components/Section';
import { LimitBar } from '@/components/LimitBar';
import { RecentSignals } from '@/components/RecentSignals';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Upload, Palette, CheckCircle2, Sparkles } from 'lucide-react';
import { Modal, ModalFooter } from '@/components/Modal';
import { createPlaybookState } from '@/lib/mockData';
import type { BusinessRecord } from '@/lib/mockData';
import { AI_AGENTS } from '@/lib/mockData';

function KpiCard({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{trend}</p>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const {
    businesses,
    activeHomeBusinessId,
    companySignals,
    marketingSetups,
    marketingSetupDismissed,
    startMarketingSetup,
    computeMarketingHealth,
    dismissMarketingSetupReminder,
    setBusinesses,
    setActiveHomeBusinessId,
  } = useCreoStore();

  const activeBusiness = useMemo(
    () => businesses.find(business => business.id === activeHomeBusinessId) ?? businesses[0],
    [businesses, activeHomeBusinessId],
  );

  const agents = useMemo(() => {
    if (!activeBusiness) return [] as { id: string; name: string; tagline: string; emoji: string }[];
    return activeBusiness.aiAgentIds.map(agentId => {
      const agent = AI_AGENTS.find(item => item.id === agentId);
      return agent
        ? { id: agent.id, name: agent.name, tagline: agent.tagline, emoji: agent.emoji }
        : { id: agentId, name: agentId, tagline: 'Automation specialist', emoji: '🤖' };
    });
  }, [activeBusiness]);

  const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardForm, setWizardForm] = useState({
    name: '',
    website: '',
    industry: '',
  });

  const marketingSetup = useMemo(() => {
    if (!activeBusiness) return undefined;
    return marketingSetups.find(setup => setup.homeBusinessId === activeBusiness.id);
  }, [activeBusiness, marketingSetups]);

  useEffect(() => {
    if (activeBusiness && !marketingSetup) {
      startMarketingSetup(activeBusiness.id);
    }
  }, [activeBusiness, marketingSetup, startMarketingSetup]);

  if (!activeBusiness) {
    return (
      <WorkspaceLayout>
        <Section title="Welcome" description="Select or create a home business to get started.">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Use the Add Business button to launch a workspace and invite the AI crew.
          </p>
        </Section>
      </WorkspaceLayout>
    );
  }

  const signals = companySignals[activeBusiness.id] ?? [];

  const marketingHealth = marketingSetup ? computeMarketingHealth(activeBusiness.id) : { score: 0, band: 'red' as const };
  const showSetupNudge =
    !activeBusiness.marketingSetupCompleted &&
    marketingSetup &&
    marketingHealth.score < 80 &&
    !marketingSetupDismissed[activeBusiness.id];

  const handleCreateBusiness = () => {
    if (!wizardForm.name.trim()) return;
    const id = wizardForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `business-${Date.now()}`;
    const defaultAgents = AI_AGENTS.slice(0, 4).map(agent => agent.id);
    const newBusiness: BusinessRecord = {
      id,
      name: wizardForm.name.trim(),
      industry: wizardForm.industry.trim() || 'Franchise operations',
      website: wizardForm.website.trim() || 'https://example.com',
      tier: 'Starter',
      goals: ['Increase franchise leads'],
      aiAgentIds: defaultAgents,
      metrics: {
        pipelineValue: 0,
        contractsSent: 0,
        meetingsBooked: 0,
        campaignVelocity: 0,
      },
      contacts: [],
      datasets: [],
      creativeDrafts: [],
      reviews: [],
      playbook: createPlaybookState(`Creo AI playbook initialized for ${wizardForm.name.trim()}.`),
      marketingSetupCompleted: false,
    };
    setBusinesses(prev => [newBusiness, ...prev]);
    setActiveHomeBusinessId(id);
    startMarketingSetup(id);
    setIsWizardOpen(false);
    setWizardForm({ name: '', website: '', industry: '' });
  };

  return (
    <WorkspaceLayout>
      {showSetupNudge ? (
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Finish basic marketing setup</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Eden estimates a +22% visibility lift after completion.</p>
            </div>
            <Chip variant={marketingHealth.band === 'green' ? 'success' : marketingHealth.band === 'amber' ? 'info' : 'warning'}>
              Score {marketingHealth.score}
            </Chip>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => router.push('/playbooks?playbook=marketing-setup')} className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Resume setup
            </Button>
            <Button variant="outline" onClick={() => dismissMarketingSetupReminder(activeBusiness.id)}>
              Hide for now
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setIsWizardOpen(true)}>
          Add Business
        </Button>
      </div>

      <Section title="Performance snapshot" description="Track how Creo AI is accelerating your franchise pipeline.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Pipeline value" value={currency.format(activeBusiness.metrics.pipelineValue)} trend="vs. last 30 days" />
          <KpiCard label="Contracts sent" value={activeBusiness.metrics.contractsSent.toString()} trend="Autopilot-ready" />
          <KpiCard label="Meetings booked" value={activeBusiness.metrics.meetingsBooked.toString()} trend="Up 12% this week" />
          <KpiCard label="Campaign velocity" value={`${activeBusiness.metrics.campaignVelocity} hrs`} trend="Avg time to contract" />
        </div>
      </Section>

      <RecentSignals signals={signals} />

      <Section title="AI crew" description="Creo AI pairs each franchise with the right mix of specialist agents.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map(agent => (
            <div
              key={agent.id}
              className="flex h-full flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-900/40"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{agent.emoji}</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{agent.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{agent.tagline}</p>
                </div>
              </div>
              <button
                type="button"
                className="mt-auto inline-flex items-center gap-2 self-start rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => router.push('/playbooks')}
              >
                View automation
              </button>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Section title="Recent autopilot events" description="See the handoffs Creo AI has already taken off your plate.">
          <div className="space-y-3">
            {activeBusiness.playbook.activity.slice(-6).reverse().map(entry => (
              <div
                key={entry.id}
                className="flex items-start justify-between rounded-2xl bg-slate-100/80 px-4 py-3 text-sm dark:bg-slate-900/60"
              >
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">{entry.message}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Logged at {entry.timestamp}</p>
                </div>
                <CheckCircle2 className="mt-1 h-4 w-4 text-emerald-500" />
              </div>
            ))}
          </div>
        </Section>
        <Section title="Libraries" description="Monitor storage across datasets and creative briefs.">
          <div className="space-y-4">
            <LimitBar label="Datasets" value={activeBusiness.datasets.length} max={12} />
            <LimitBar label="Creative drafts" value={activeBusiness.creativeDrafts.length} max={16} />
            <Link
              href="/training"
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Upload className="h-4 w-4" /> Add new dataset
            </Link>
            <Link
              href="/creative"
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Palette className="h-4 w-4" /> Create creative brief
            </Link>
          </div>
        </Section>
      </div>

      <Modal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title="Add Home Business"
        description="Kick off a new franchise workspace and invite the AI crew to collaborate."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="text-slate-600 dark:text-slate-300">Business name *</span>
            <input
              value={wizardForm.name}
              onChange={event => setWizardForm(prev => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-slate-600 dark:text-slate-300">Website</span>
            <input
              value={wizardForm.website}
              onChange={event => setWizardForm(prev => ({ ...prev, website: event.target.value }))}
              placeholder="https://"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
          </label>
          <label className="space-y-2 text-sm sm:col-span-2">
            <span className="text-slate-600 dark:text-slate-300">Industry focus</span>
            <input
              value={wizardForm.industry}
              onChange={event => setWizardForm(prev => ({ ...prev, industry: event.target.value }))}
              placeholder="Wellness, retail, nonprofit..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
          </label>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsWizardOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateBusiness} disabled={!wizardForm.name.trim()}>
            Create
          </Button>
        </ModalFooter>
      </Modal>
    </WorkspaceLayout>
  );
}
