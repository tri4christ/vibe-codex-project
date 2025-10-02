"use client";

import { useEffect, useMemo, useState } from 'react';
import { Section } from '@/components/Section';
import { Chip } from '@/components/Chip';
import { Button } from '@/components/Button';
import { HealthScore } from '@/components/setup/HealthScore';
import { ArtifactCard } from '@/components/setup/ArtifactCard';
import { SignalCard } from '@/components/setup/SignalCard';
import { SetupTaskDrawer } from '@/components/setup/SetupTaskDrawer';
import { useCreoStore } from '@/lib/store';
import { AI_AGENTS } from '@/lib/mockData';
import type { MarketingSetup as MarketingSetupType, SetupArtifact, SetupTask, SignalItem } from '@/lib/types';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface MarketingSetupProps {
  homeBusinessId: string;
  signals: SignalItem[];
}

const OWNER_META = AI_AGENTS.reduce<Record<string, { emoji: string; tagline: string }>>((acc, agent) => {
  acc[agent.name] = { emoji: agent.emoji, tagline: agent.tagline };
  return acc;
}, {});

const STATUS_LABEL: Record<string, string> = {
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
  blocked: 'Blocked',
  skipped: 'Skipped',
};

export function MarketingSetup({ homeBusinessId, signals }: MarketingSetupProps) {
  const {
    startMarketingSetup,
    marketingSetups,
    updateSetupTask,
    addSetupArtifact,
    logSetup,
    computeMarketingHealth,
    setMarketingRequiresApproval,
    markMarketingSetupComplete,
  } = useCreoStore();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    startMarketingSetup(homeBusinessId);
  }, [homeBusinessId, startMarketingSetup]);

  const setup = marketingSetups.find(item => item.homeBusinessId === homeBusinessId);

  const health = computeMarketingHealth(homeBusinessId);
  const selectedTask = setup?.tasks.find(task => task.id === selectedTaskId) ?? null;

  const groupedTasks = useMemo(() => {
    if (!setup) return [] as Array<{ group: string; tasks: SetupTask[] }>;
    const groups = new Map<string, SetupTask[]>();
    setup.tasks.forEach(task => {
      if (!groups.has(task.group)) {
        groups.set(task.group, []);
      }
      groups.get(task.group)!.push(task);
    });
    return Array.from(groups.entries()).map(([group, tasks]) => ({ group, tasks }));
  }, [setup]);

  const artifacts: SetupArtifact[] = useMemo(() => {
    if (!setup) return [];
    return setup.tasks.flatMap(task => task.artifacts ?? []);
  }, [setup]);

  const signalCards = useMemo(() => {
    if (!setup) return [];
    if (signals.length) return signals;
    return marketingSignalsFallback(setup.activity.length);
  }, [setup, signals]);

  if (!setup) {
    return (
      <Section title="Marketing setup" description="Initialising tasks..." />
    );
  }

  const criticalTasks = setup.tasks.filter(task => task.impact === 'critical');
  const completed = Boolean(setup.completedAt);
  const canMarkComplete = !completed && criticalTasks.every(task => task.status === 'done' && (!task.requiresApproval || task.approved));
  const readyBadge = completed || (health.score >= 80 && canMarkComplete);

  return (
    <div className="space-y-6">
      <Section
        title="Marketing Setup (New Business)"
        description="Walk through the essential marketing foundations for this home business."
        actions={
          <div className="flex items-center gap-3">
            {readyBadge ? (
              <Chip variant="success" className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> {completed ? 'Setup completed' : 'Setup looks great'}
              </Chip>
            ) : null}
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={setup.requiresApproval}
                onChange={event => setMarketingRequiresApproval(homeBusinessId, event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 dark:border-slate-600 dark:text-slate-100"
              />
              Require approvals before publishing
            </label>
          </div>
        }
      >
        <div className="flex flex-wrap items-center gap-6">
          <HealthScore score={health.score} band={health.band} label="Marketing health" />
          <div className="space-y-1 text-sm text-slate-500 dark:text-slate-400">
            <p>{criticalTasks.filter(task => task.status === 'done').length}/{criticalTasks.length} critical tasks complete.</p>
            <p>Recent activity: {setup.activity[0]?.msg ?? 'Getting started.'}</p>
          </div>
        </div>
      </Section>

      {groupedTasks.map(section => (
        <Section key={section.group} title={section.group}>
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="hidden bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400 sm:grid sm:grid-cols-[1.6fr_120px_110px_110px_1fr]">
              <span>Task</span>
              <span>Owner</span>
              <span>Status</span>
              <span>Impact</span>
              <span>Actions</span>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {section.tasks.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onOpen={() => setSelectedTaskId(task.id)}
                  onAction={action => handleTaskAction(setup, task, action, addSetupArtifact, updateSetupTask, logSetup)}
                />
              ))}
            </div>
          </div>
        </Section>
      ))}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Section title="Activity log" description="Latest updates across the marketing setup.">
          <div className="space-y-3 text-sm">
            {setup.activity.map(entry => (
              <div key={entry.at} className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-slate-700 dark:text-slate-200">{entry.msg}</p>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{new Date(entry.at).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>
        <div className="space-y-4">
          <Section title="Latest artifacts" description="Outputs generated by the AI crew." className="bg-white/80 dark:bg-slate-900/40">
            <div className="space-y-3">
              {artifacts.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No artifacts yet. Trigger actions to generate assets.</p>
              ) : (
                artifacts.slice(0, 4).map(artifact => <ArtifactCard key={artifact.id} artifact={artifact} />)
              )}
            </div>
          </Section>
          <Section title="Signals" description="Recent press and social updates to reference." className="bg-white/80 dark:bg-slate-900/40">
            <div className="space-y-3">
              {signalCards.map(signal => (
                <SignalCard key={signal.id} signal={signal} />
              ))}
            </div>
          </Section>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          className="flex items-center gap-2"
          onClick={() => {
            markMarketingSetupComplete(homeBusinessId);
            logSetup(homeBusinessId, 'Marketing setup marked complete.');
          }}
          disabled={!canMarkComplete}
        >
          <Sparkles className="h-4 w-4" />
          Mark setup complete
        </Button>
      </div>

      <SetupTaskDrawer
        task={selectedTask}
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTaskId(null)}
        onSaveFields={fields => updateSetupTask(homeBusinessId, selectedTask!.id, { fields })}
        onAction={action => handleTaskAction(setup, selectedTask!, action, addSetupArtifact, updateSetupTask, logSetup)}
        onApprovalChange={approved => updateSetupTask(homeBusinessId, selectedTask!.id, { approved, status: approved ? 'done' : selectedTask!.status })}
      />
    </div>
  );
}

interface TaskRowProps {
  task: SetupTask;
  onOpen: () => void;
  onAction: (action: string) => void;
}

function TaskRow({ task, onOpen, onAction }: TaskRowProps) {
  const owner = OWNER_META[task.owner] ?? { emoji: '🤖', tagline: '' };
  return (
    <div className="grid gap-3 px-4 py-3 text-sm sm:grid-cols-[1.6fr_120px_110px_110px_1fr]">
      <div>
        <p className="font-semibold text-slate-900 dark:text-slate-100">{task.title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{task.description}</p>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>{owner.emoji}</span>
        {task.owner}
      </div>
      <div>
        <Chip variant={task.status === 'done' ? 'success' : task.status === 'in-progress' ? 'info' : task.status === 'blocked' ? 'warning' : 'neutral'}>
          {STATUS_LABEL[task.status] ?? task.status}
        </Chip>
      </div>
      <div>
        <Chip variant={task.impact === 'critical' ? 'warning' : task.impact === 'high' ? 'info' : 'neutral'}>
          {capitalize(task.impact)}
        </Chip>
      </div>
      <div className="flex flex-wrap gap-2">
        {task.actions.map(action => (
          <Button
            key={`${task.id}-${action}`}
            size="sm"
            variant={action === 'Open' ? 'outline' : 'ghost'}
            onClick={() => (action === 'Open' ? onOpen() : onAction(action))}
          >
            {action}
          </Button>
        ))}
      </div>
    </div>
  );
}

function handleTaskAction(
  setup: MarketingSetupType,
  task: SetupTask,
  action: string,
  addSetupArtifact: (homeBusinessId: string, taskId: string, artifact: SetupArtifact) => void,
  updateSetupTask: (homeBusinessId: string, taskId: string, patch: Partial<SetupTask>) => void,
  logSetup: (homeBusinessId: string, message: string) => void,
) {
  const homeBusinessId = setup.homeBusinessId;
  const baseMessage = `${task.title}: ${action}`;

  switch (action) {
    case 'Open':
      return;
    case 'Generate':
    case 'Draft':
    case 'Suggest':
    case 'Generate tags':
    case 'Run':
    case 'Validate':
    case 'Scan':
    case 'Check':
    case 'Simulate':
    case 'Enable':
    case 'Assess':
    case 'Fix':
    case 'Reserve':
    case 'Add':
    case 'Log':
    case 'View':
    case 'Copy':
    case 'Download':
    case 'Preview':
      updateSetupTask(homeBusinessId, task.id, { status: 'in-progress' });
      addSetupArtifact(homeBusinessId, task.id, createArtifact(task, action));
      logSetup(homeBusinessId, `${baseMessage} — artifact generated.`);
      break;
    case 'Approve':
      updateSetupTask(homeBusinessId, task.id, { approved: true, status: 'done' });
      logSetup(homeBusinessId, `${baseMessage} — approved.`);
      break;
    case 'Mark done':
      if (setup.requiresApproval && task.requiresApproval && !task.approved) {
        alert('Approve this task before marking it done.');
        return;
      }
      updateSetupTask(homeBusinessId, task.id, { status: 'done' });
      logSetup(homeBusinessId, `${baseMessage} — marked done.`);
      break;
    case 'Mark blocked':
      updateSetupTask(homeBusinessId, task.id, { status: 'blocked' });
      logSetup(homeBusinessId, `${baseMessage} — blocked.`);
      break;
    case 'Skip':
      updateSetupTask(homeBusinessId, task.id, { status: 'skipped' });
      logSetup(homeBusinessId, `${baseMessage} — skipped.`);
      break;
    default:
      break;
  }
}

function createArtifact(task: SetupTask, action: string): SetupArtifact {
  const id = `${task.id}-artifact-${Date.now()}`;
  const timestamp = new Date().toLocaleString();

  if (task.id === 'seo-localbusiness-schema') {
    return {
      id,
      kind: 'json',
      title: 'LocalBusiness Schema JSON',
      preview: '{\n  "@context": "https://schema.org",\n  "@type": "LocalBusiness",\n  "name": "' + (task.fields?.businessName ?? 'Sample Business') + '\"\n}',
    };
  }

  if (task.id === 'seo-homepage-metadata') {
    return {
      id,
      kind: 'text',
      title: 'Homepage meta tags',
      preview: `Title: ${task.fields?.metaTitle || 'Compelling Local Wellness Support'}\nDescription: ${task.fields?.metaDescription || 'Book virtual and in-person sessions with our award-winning team.'}`,
    };
  }

  if (task.id === 'reviews-review-links') {
    return {
      id,
      kind: 'link',
      title: 'Review request links',
      preview: task.fields?.google || 'https://g.page/example-review',
    };
  }

  if (task.id === 'branding-social-banner-pack') {
    return {
      id,
      kind: 'image',
      title: 'Social banner previews',
      preview: 'LinkedIn 1584x396 · Facebook 1640x924 · Twitter 1500x500',
    };
  }

  if (task.id === 'branding-elevator-pitch') {
    return {
      id,
      kind: 'text',
      title: 'Elevator pitch draft',
      preview: task.fields?.elevatorPitch || 'We bring coastal calm to busy families with on-demand counseling.',
    };
  }

  if (task.id === 'seo-local-keywords') {
    return {
      id,
      kind: 'text',
      title: 'Keyword seed list',
      preview: task.fields?.keywords || 'community wellness, virtual counseling, coastal therapy',
    };
  }

  if (task.id === 'reviews-request-templates') {
    return {
      id,
      kind: 'text',
      title: 'Review request templates',
      preview: `Email:\n${task.fields?.emailTemplate ?? 'Hi {{name}}, we would love your feedback!'}\n\nSMS:\n${task.fields?.smsTemplate ?? 'Thanks for choosing us — share a review at {{link}}.'}`,
    };
  }

  if (task.id === 'data-faq-knowledge-base') {
    return {
      id,
      kind: 'text',
      title: 'FAQ outline',
      preview: task.fields?.faqs || 'Q: What areas do you serve?\nA: Coastal communities.\nQ: Do you support telehealth?\nA: Yes, across the state.' ,
    };
  }

  if (task.id === 'communication-cta-presence') {
    return {
      id,
      kind: 'text',
      title: 'CTA checklist',
      preview: `Homepage CTA: ${task.fields?.homepageCTA ?? 'Book a session'}\nContact CTA: ${task.fields?.contactCTA ?? 'Call now'}`,
    };
  }

  if (task.id === 'wow-social-post-starter-kit') {
    return {
      id,
      kind: 'text',
      title: 'Social post starter kit',
      preview: '10 caption drafts with image prompts ready for scheduling.',
    };
  }

  if (task.id === 'wow-welcome-email-sequence') {
    return {
      id,
      kind: 'text',
      title: 'Welcome email sequence',
      preview: 'Three-touch onboarding sequence drafted with personalization hooks.',
    };
  }

  return {
    id,
    kind: 'text',
    title: `${task.title} — ${action}`,
    preview: `${task.title} ${action.toLowerCase()} on ${timestamp}.`,
  };
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function marketingSignalsFallback(seed: number) {
  const now = Date.now() + seed;
  return [
    {
      id: `marketing-signal-press-${seed}`,
      kind: 'press' as const,
      title: 'Local press highlights new location opening',
      source: 'Regional Post',
      url: '#',
      publishedAt: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
      takeaway: 'Use in outreach for community credibility.',
    },
    {
      id: `marketing-signal-social-${seed}`,
      kind: 'social' as const,
      title: 'Instagram: behind-the-scenes story hits 2k views',
      source: 'Instagram',
      url: '#',
      publishedAt: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
      takeaway: 'Repurpose as a boosted story with CTA.',
    },
  ];
}
