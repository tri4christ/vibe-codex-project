"use client";

import { useMemo, useState, useEffect, type ReactElement, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { WorkspaceLayout } from '@/components/WorkspaceLayout';
import { Section } from '@/components/Section';
import { Chip } from '@/components/Chip';
import { Button } from '@/components/Button';
import { PersonalizationPanel } from '@/components/PersonalizationPanel';
import { RecentSignals } from '@/components/RecentSignals';
import { MarketingSetup } from '@/components/playbooks/MarketingSetup';
import { useCreoStore } from '@/lib/store';
import { PLAYBOOK_STEPS, AI_AGENTS } from '@/lib/mockData';
import type { ProspectBusiness, SignalItem, ContactMemory } from '@/lib/types';
import type { ContactRecord } from '@/lib/mockData';
import type { BusinessPlaybookState } from '@/lib/mockData';
import { Sparkles, FileText, Users, Bot } from 'lucide-react';
import { features } from '@/lib/features';
import { FocusWorkspace } from '@/components/focus/FocusWorkspace';

interface DiscoveryCandidate {
  id: string;
  name: string;
  website: string;
  industry: string;
  icpFit: number;
  region: string;
}

const DISCOVERY_POOL: DiscoveryCandidate[] = [
  {
    id: 'pool-1',
    name: 'Harborlight Therapy Group',
    website: 'https://harborlighttherapy.com',
    industry: 'Mental wellness clinics',
    icpFit: 78,
    region: 'Pacific Northwest',
  },
  {
    id: 'pool-2',
    name: 'Summit Ridge Outfitter Co.',
    website: 'https://summitridgeoutfitters.com',
    industry: 'Outdoor retail',
    icpFit: 70,
    region: 'Rocky Mountains',
  },
];

const MARKETING_OWNERS = ['Scout', 'Story', 'Piper', 'Caleb', 'Eden', 'Leo'];

export default function PlaybooksPage() {
  if (features.focusPlaybooks) {
    return <FocusWorkspace />;
  }
  return <LegacyPlaybooksPage />;
}

function LegacyPlaybooksPage() {
  const searchParams = useSearchParams();
  const initialPlaybook = searchParams?.get('playbook') === 'marketing-setup' ? 'marketing-setup' : 'prospect-to-contract';
  const [selectedPlaybook, setSelectedPlaybook] = useState<'prospect-to-contract' | 'marketing-setup'>(initialPlaybook);

  useEffect(() => {
    const param = searchParams?.get('playbook');
    if (param === 'marketing-setup') {
      setSelectedPlaybook('marketing-setup');
    } else if (param === 'prospect-to-contract') {
      setSelectedPlaybook('prospect-to-contract');
    }
  }, [searchParams]);

  const {
    businesses,
    setBusinesses,
    activeHomeBusinessId,
    companySignals,
    addProspect,
    prospects,
    addPerson,
    people,
    memories,
    appendPricingFact,
    marketingSetups,
    computeMarketingHealth,
  } = useCreoStore();

  const [discoveryQueue, setDiscoveryQueue] = useState<DiscoveryCandidate[]>(DISCOVERY_POOL);
  const [sessionProspects, setSessionProspects] = useState<string[]>([]);
  const [enrichedProspects, setEnrichedProspects] = useState<string[]>([]);

  const activeBusiness = useMemo(
    () => businesses.find(business => business.id === activeHomeBusinessId) ?? businesses[0],
    [businesses, activeHomeBusinessId],
  );

  const signals = activeBusiness ? companySignals[activeBusiness.id] ?? [] : [];
  const homeProspects = useMemo(
    () => prospects.filter(prospect => prospect.homeBusinessId === activeHomeBusinessId),
    [prospects, activeHomeBusinessId],
  );
  const homePeople = useMemo(
    () => people.filter(person => person.homeBusinessId === activeHomeBusinessId),
    [people, activeHomeBusinessId],
  );
  const activeContact = homePeople[0];
  const activeMemory = activeContact ? memories[activeContact.id] : undefined;
  const marketingSetup = marketingSetups.find(setup => setup.homeBusinessId === activeHomeBusinessId);
  const marketingHealth = marketingSetup ? computeMarketingHealth(activeHomeBusinessId) : { score: 0, band: 'red' as const };

  function updateBusinessPlaybook(stepId: string) {
    if (!activeBusiness) return;
    setBusinesses(prev =>
      prev.map(business => {
        if (business.id !== activeBusiness.id) return business;
        if (business.playbook.steps[stepId] === 'completed') return business;
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          ...business,
          playbook: {
            steps: { ...business.playbook.steps, [stepId]: 'completed' },
            activity: [
              ...business.playbook.activity,
              {
                id: `log-${stepId}-${Date.now()}`,
                timestamp,
                message: `${PLAYBOOK_STEPS.find(step => step.id === stepId)?.title ?? 'Step'} completed and synced to the workspace.`,
              },
            ],
          },
        };
      }),
    );
    if (stepId === 'pricing' && activeContact && activeBusiness) {
      const contactSnapshot: ContactRecord = {
        id: activeContact.id,
        name: activeContact.name,
        role: activeContact.title ?? 'Prospect contact',
        company: activeBusiness.name,
        stage: 'Discovery',
        lastTouch: 'Recently',
      };
      appendPricingFact(contactSnapshot);
    }
  }

  function handleAddProspect(candidate: DiscoveryCandidate) {
    if (!activeBusiness) return;
    const prospect: ProspectBusiness = {
      id: `prospect-${Date.now()}`,
      homeBusinessId: activeBusiness.id,
      name: candidate.name,
      website: candidate.website,
      industry: candidate.industry,
      size: undefined,
      region: candidate.region,
      segment: undefined,
      source: 'Discovery',
      owner: 'Scout',
      icpFit: candidate.icpFit,
      priority: 'P2',
      stage: 'Discovered',
      tags: ['Autopilot'],
      updatedAt: new Date().toISOString(),
    };
    addProspect(prospect);
    setSessionProspects(prev => [prospect.id, ...prev]);
    setDiscoveryQueue(prev => prev.filter(item => item.id !== candidate.id));
  }

  function handleEnrichProspect(prospectId: string) {
    const prospect = homeProspects.find(item => item.id === prospectId);
    if (!prospect) return;
    addPerson({
      id: `person-${prospectId}-${Date.now()}`,
      prospectBusinessId: prospectId,
      homeBusinessId: prospect.homeBusinessId,
      name: `${prospect.name.split(' ')[0]} Liaison`,
      title: 'Operations Lead',
      email: `hello@${(prospect.website ?? '').replace('https://', '') || 'example.com'}`,
      phone: undefined,
      role: 'Champion',
      stage: 'Nurturing',
      updatedAt: new Date().toISOString(),
    });
    setEnrichedProspects(prev => [...prev, prospectId]);
  }

  const libraryCard = (options: {
    id: 'prospect-to-contract' | 'marketing-setup';
    title: string;
    description: string;
    icon: ReactElement;
    meta: string;
    footer?: ReactNode;
  }) => (
    <button
      key={options.id}
      onClick={() => setSelectedPlaybook(options.id)}
      className={`flex flex-col gap-3 rounded-2xl border px-5 py-5 text-left transition ${
        selectedPlaybook === options.id
          ? 'border-slate-900 bg-slate-900 text-white shadow dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-1 rounded-full bg-slate-900/10 p-2 text-slate-600 dark:bg-slate-100/10 dark:text-slate-300">
          {options.icon}
        </span>
        <div className="space-y-1">
          <h3 className="text-base font-semibold">{options.title}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">{options.description}</p>
          <p className="text-xs uppercase tracking-wide text-slate-400">{options.meta}</p>
        </div>
      </div>
      {options.footer}
    </button>
  );

  const headerActions =
    selectedPlaybook === 'prospect-to-contract' ? (
      <Button size="sm" onClick={() => updateBusinessPlaybook('discovery')} className="flex items-center gap-2">
        <Sparkles className="h-4 w-4" /> Mark discovery complete
      </Button>
    ) : undefined;

  return (
    <WorkspaceLayout headerActions={headerActions}>
      <Section title="Playbooks" description="Choose a playbook to orchestrate with the AI crew.">
        <div className="grid gap-4 lg:grid-cols-2">
          {libraryCard({
            id: 'prospect-to-contract',
            title: 'Prospect → Contract Autopilot',
            description: 'Advance every opportunity from discovery to signed contract.',
            icon: <Bot className="h-4 w-4" />,
            meta: 'Owners: Scout · Piper · Story · Leo',
            footer: (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {sessionProspects.length} prospects added this session · {enrichedProspects.length} contacts enriched
              </p>
            ),
          })}
          {libraryCard({
            id: 'marketing-setup',
            title: 'Marketing Setup (New Business)',
            description: 'Complete the foundational checklist for a new home business.',
            icon: <Users className="h-4 w-4" />,
            meta: marketingSetup
              ? `Health ${marketingHealth.score} · Crew: ${MARKETING_OWNERS.join(' · ')}`
              : `Crew: ${MARKETING_OWNERS.join(' · ')}`,
          })}
        </div>
      </Section>

      {selectedPlaybook === 'prospect-to-contract' ? (
        <ProspectToContract
          activeBusinessName={activeBusiness?.name ?? 'Home Business'}
          playbookState={activeBusiness?.playbook}
          signals={signals}
          discoveryQueue={discoveryQueue}
          sessionProspects={sessionProspects}
          enrichedProspects={enrichedProspects}
          homeProspects={homeProspects}
          activeContact={activeContact}
          activeMemory={activeMemory}
          onAddProspect={handleAddProspect}
          onEnrichProspect={handleEnrichProspect}
          onSetDiscoveryQueue={setDiscoveryQueue}
          updateBusinessPlaybook={updateBusinessPlaybook}
        />
      ) : (
        <MarketingSetup homeBusinessId={activeHomeBusinessId} signals={signals} />
      )}
    </WorkspaceLayout>
  );
}

interface ProspectToContractProps {
  activeBusinessName: string;
  playbookState?: BusinessPlaybookState;
  signals: SignalItem[];
  discoveryQueue: DiscoveryCandidate[];
  sessionProspects: string[];
  enrichedProspects: string[];
  homeProspects: ProspectBusiness[];
  activeContact?: { id: string } | null;
  activeMemory: ContactMemory | undefined;
  onAddProspect: (candidate: DiscoveryCandidate) => void;
  onEnrichProspect: (prospectId: string) => void;
  onSetDiscoveryQueue: (queue: DiscoveryCandidate[]) => void;
  updateBusinessPlaybook: (stepId: string) => void;
}

function ProspectToContract({
  activeBusinessName,
  playbookState,
  signals,
  discoveryQueue,
  sessionProspects,
  enrichedProspects,
  homeProspects,
  activeContact,
  activeMemory,
  onAddProspect,
  onEnrichProspect,
  onSetDiscoveryQueue,
  updateBusinessPlaybook,
}: ProspectToContractProps) {
  const state: BusinessPlaybookState =
    playbookState ?? { steps: {} as Record<string, 'idle' | 'completed'>, activity: [] };

  return (
    <>
      <Section title="Discovery" description="Creo AI surfaces likely-fit businesses. Add them to your Prospect pipeline." contentClassName="space-y-4">
        {discoveryQueue.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Discovery queue is clear. Come back after the next Scout crawl.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {discoveryQueue.map(candidate => (
              <div key={candidate.id} className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{candidate.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{candidate.industry}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{candidate.region}</p>
                  </div>
                  <Chip variant="info">ICP {candidate.icpFit}</Chip>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => onAddProspect(candidate)} className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> Add to Prospects
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onSetDiscoveryQueue(discoveryQueue.filter(item => item.id !== candidate.id))}>
                    Ignore
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Enrichment" description="Generate buying committee contacts linked to your new prospects." contentClassName="space-y-4">
        {sessionProspects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Add a Prospect Business first to start enrichment.
          </div>
        ) : (
          <div className="space-y-4">
            {sessionProspects.map(prospectId => {
              const prospect = homeProspects.find(item => item.id === prospectId);
              if (!prospect) return null;
              const alreadyEnriched = enrichedProspects.includes(prospectId);
              return (
                <div key={prospectId} className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{prospect.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Stage: {prospect.stage}</p>
                    </div>
                    <Chip variant={alreadyEnriched ? 'success' : 'info'}>{alreadyEnriched ? 'Contacts added' : 'Ready'}</Chip>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => onEnrichProspect(prospectId)} disabled={alreadyEnriched} className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" /> Generate contacts
                    </Button>
                    <Button size="sm" variant="outline" disabled={!alreadyEnriched} className="flex items-center gap-2" onClick={() => updateBusinessPlaybook('enrich')}>
                      <FileText className="h-4 w-4" /> View enrichment
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <Section
        title="Prospect to Contract autopilot"
        description={`Trigger each stage to see how Creo AI advances ${activeBusinessName} from discovery to signed contract.`}
        contentClassName="space-y-4"
      >
        {PLAYBOOK_STEPS.map(step => {
          const isCompleted = state.steps[step.id] === 'completed';
          return (
            <div key={step.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{step.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{step.description}</p>
                </div>
                <Chip variant={isCompleted ? 'success' : 'neutral'}>
                  {isCompleted ? 'Completed' : 'Ready'}
                </Chip>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => updateBusinessPlaybook(step.id)}
                  disabled={isCompleted}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  {step.cta}
                </Button>
                <Button size="sm" variant="outline" disabled={!isCompleted} className="flex items-center gap-2">
                  <FileText className="h-4 w-4" /> View transcript
                </Button>
              </div>
            </div>
          );
        })}
      </Section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
        <Section title="Activity log" description="Each action is stamped for audit.">
          <div className="space-y-3 text-sm">
            {state.activity.slice(-12).reverse().map(entry => (
              <div key={entry.id} className="rounded-2xl bg-slate-100/80 px-4 py-3 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-800 dark:text-slate-200">{entry.message}</p>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{entry.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>
        <div className="space-y-6">
          {activeContact ? (
            <PersonalizationPanel contactId={activeContact.id} memory={activeMemory} signals={signals} />
          ) : (
            <Section title="Draft personalization" description="Add a contact to see personalization toggles.">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Once a contact is linked, tailored tone, interests, and signal controls unlock here.
              </p>
            </Section>
          )}
          <RecentSignals signals={signals} />
        </div>
      </div>
    </>
  );
}
