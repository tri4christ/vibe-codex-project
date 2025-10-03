"use client";

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Image from 'next/image';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useOnboarding } from '@/lib/onboarding/store';
import { ONBOARDING_SECTIONS, TOTAL_ONBOARDING_STEPS, type OnboardingSectionId } from '@/lib/onboarding/flow';
import { useCreoStore } from '@/lib/store';
import { AGENTS, getAvatar, type Agent } from '@/lib/agents';
import { cn } from '@/lib/utils';
import type {
  VoiceProfileV1,
  ICPv1,
  OutreachPolicy,
  ReputationRules,
  SuccessPlanV1,
  WebSetupPlan,
  OnboardingRecap,
} from '@/lib/onboarding/types';

const DEFAULT_VOICE: VoiceProfileV1 = { tone: 'Warm/supportive', uploads: [] };
const DEFAULT_ICP: ICPv1 = { mode: 'b2b' };
const DEFAULT_OUTREACH: OutreachPolicy = { pace: 'normal', requiresApproval: true, channels: ['Email'] };
const DEFAULT_REPUTATION: ReputationRules = { connectGoogle: true, connectFacebook: false, connectYelp: false, tone: 'grateful', escalateLowRatings: true };
const DEFAULT_SUCCESS: SuccessPlanV1 = { primaryKpi: 'Leads', reminders: { daily: false, weekly: true, urgentOnly: false } };
const DEFAULT_WEB: WebSetupPlan = { enableLeadForm: true, destination: '', integrations: { shopify: false, crm: true, gmail: true } };
const CLIENT_AGENT_ID = 'katie-elliott';

export function OnboardingPanel() {
  const onboarding = useOnboarding();
  const { businesses } = useCreoStore();
  const business = useMemo(
    () => businesses.find(item => item.id === onboarding.activeBusinessId),
    [businesses, onboarding.activeBusinessId],
  );

  const [voice, setVoice] = useState<VoiceProfileV1>(DEFAULT_VOICE);
  const [icp, setIcp] = useState<ICPv1>(DEFAULT_ICP);
  const [outreach, setOutreach] = useState<OutreachPolicy>(DEFAULT_OUTREACH);
  const [reputation, setReputation] = useState<ReputationRules>(DEFAULT_REPUTATION);
  const [success, setSuccess] = useState<SuccessPlanV1>(DEFAULT_SUCCESS);
  const [web, setWeb] = useState<WebSetupPlan>(DEFAULT_WEB);

  useEffect(() => {
    if (!onboarding.open) return;
    setVoice(onboarding.data.voice ?? DEFAULT_VOICE);
    setIcp(onboarding.data.icp ?? DEFAULT_ICP);
    setOutreach(onboarding.data.outreach ?? DEFAULT_OUTREACH);
    setReputation(onboarding.data.reputation ?? DEFAULT_REPUTATION);
    setSuccess(onboarding.data.success ?? DEFAULT_SUCCESS);
    setWeb(onboarding.data.web ?? DEFAULT_WEB);
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        attemptClose(onboarding.closeOnboarding);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onboarding.open]);

  if (!onboarding.open || !business) {
    return null;
  }

  const section = ONBOARDING_SECTIONS[onboarding.stepIndex];
  const agent = section ? AGENTS.find(item => item.id === section.agentId) : undefined;
  const client = AGENTS.find(item => item.id === CLIENT_AGENT_ID);
  const inRecap = onboarding.stepIndex >= TOTAL_ONBOARDING_STEPS;

  const continueLabel = section?.id === 'web' ? 'Finish' : 'Continue';

  const handleContinue = () => {
    switch (section?.id) {
      case 'voice':
        onboarding.saveVoice(voice);
        onboarding.nextStep();
        break;
      case 'icp':
        onboarding.saveICP(icp);
        onboarding.nextStep();
        break;
      case 'guardrails':
        onboarding.saveOutreach(outreach);
        onboarding.nextStep();
        break;
      case 'reputation':
        onboarding.saveReputation(reputation);
        onboarding.nextStep();
        break;
      case 'success':
        onboarding.saveSuccess(success);
        onboarding.nextStep();
        break;
      case 'web': {
        onboarding.saveWeb(web);
        const recap = buildRecap(business, { voice, icp, outreach, reputation, success, web });
        onboarding.setRecap(recap);
        break;
      }
      default:
        break;
    }
  };

  const handleSkip = () => onboarding.skipStep();

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur">
      <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl transition dark:bg-slate-950 sm:rounded-l-[32px]">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {agent ? <AgentAvatar agent={agent} /> : null}
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {agent ? `${agent.name} • Onboarding for ${business.name}` : `Onboarding • ${business.name}`}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Scout is guiding Katie through setup.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!inRecap ? (
              <Chip variant="info" className="text-[10px]">
                Step {onboarding.stepIndex + 1} of {TOTAL_ONBOARDING_STEPS}
              </Chip>
            ) : null}
            <button
              type="button"
              onClick={() => attemptClose(onboarding.closeOnboarding)}
              className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Close onboarding"
            >
              ✕
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {inRecap && onboarding.recap ? (
            <RecapView
              recap={onboarding.recap}
              notes={onboarding.data.notes ?? ''}
              onNotesChange={onboarding.setNotes}
              onClose={onboarding.closeOnboarding}
            />
          ) : section ? (
            <form
              className="flex flex-col gap-6"
              onSubmit={event => {
                event.preventDefault();
                handleContinue();
              }}
            >
              <div className="space-y-4">
                <ChatBubble role="agent" agent={agent}>
                  <div className="space-y-3">
                    <p className="text-base font-semibold leading-6">
                      {agent ? `${agent.name} • ${section.title}` : section.title}
                    </p>
                    <ul className="list-disc space-y-1 pl-5 text-sm">
                      {section.prompts.map(prompt => (
                        <li key={prompt}>{prompt}</li>
                      ))}
                    </ul>
                  </div>
                </ChatBubble>
                <ChatBubble role="client" agent={client}>
                  <div className="space-y-4">
                    {renderStepFields(section.id, {
                      voice,
                      setVoice,
                      icp,
                      setIcp,
                      outreach,
                      setOutreach,
                      reputation,
                      setReputation,
                      success,
                      setSuccess,
                      web,
                      setWeb,
                    })}
                  </div>
                </ChatBubble>
              </div>
              <StepFooter
                onSkip={handleSkip}
                onBack={onboarding.stepIndex > 0 ? onboarding.previousStep : undefined}
                continueLabel={continueLabel}
              />
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function renderStepFields(
  sectionId: OnboardingSectionId,
  state: {
    voice: VoiceProfileV1;
    setVoice: (value: VoiceProfileV1) => void;
    icp: ICPv1;
    setIcp: (value: ICPv1) => void;
    outreach: OutreachPolicy;
    setOutreach: (value: OutreachPolicy) => void;
    reputation: ReputationRules;
    setReputation: (value: ReputationRules) => void;
    success: SuccessPlanV1;
    setSuccess: (value: SuccessPlanV1) => void;
    web: WebSetupPlan;
    setWeb: (value: WebSetupPlan) => void;
  },
) {
  switch (sectionId) {
    case 'voice':
      return (
        <>
          <TextareaField
            label="Mission / Vision"
            rows={4}
            placeholder="Paste a short mission or vision statement"
            value={state.voice.missionVision ?? ''}
            onChange={value => state.setVoice({ ...state.voice, missionVision: value })}
          />
          <SelectField
            label="Tone"
            options={['Warm/supportive', 'Bold/energetic', 'Professional/polished', 'Grounded/honest', 'Other…']}
            value={state.voice.tone ?? 'Warm/supportive'}
            onChange={value => state.setVoice({ ...state.voice, tone: value })}
          />
          {state.voice.tone === 'Other…' ? (
            <InputField
              label="Custom tone"
              value={state.voice.customTone ?? ''}
              onChange={value => state.setVoice({ ...state.voice, customTone: value })}
              placeholder="Describe the tone in your own words"
            />
          ) : null}
          <TextareaField
            label="Phrases to embrace"
            value={state.voice.doPhrases ?? ''}
            onChange={value => state.setVoice({ ...state.voice, doPhrases: value })}
            rows={3}
            placeholder="Taglines, promises, key phrases"
          />
          <TextareaField
            label="Phrases to avoid"
            value={state.voice.dontPhrases ?? ''}
            onChange={value => state.setVoice({ ...state.voice, dontPhrases: value })}
            rows={3}
            placeholder="Taboo topics or wording"
          />
          <label className="space-y-2 text-sm">
            <span className="text-slate-600 dark:text-slate-300">Uploads</span>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              onChange={event => {
                const files = Array.from(event.target.files ?? []).map(file => file.name);
                state.setVoice({
                  ...state.voice,
                  uploads: Array.from(new Set([...(state.voice.uploads ?? []), ...files])) ?? [],
                });
              }}
              className="w-full rounded-2xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400"
            />
            {state.voice.uploads?.length ? (
              <ul className="text-xs text-slate-500 dark:text-slate-400">
                {state.voice.uploads.map(file => (
                  <li key={file}>• {file}</li>
                ))}
              </ul>
            ) : null}
          </label>
        </>
      );
    case 'icp':
      return (
        <>
          <SelectField
            label="B2B or B2C"
            options={['b2b', 'b2c']}
            value={state.icp.mode}
            onChange={value => state.setIcp({ ...state.icp, mode: value as ICPv1['mode'] })}
          />
          <TextareaField
            label="Industries / segments"
            value={state.icp.industries ?? ''}
            onChange={value => state.setIcp({ ...state.icp, industries: value })}
            rows={3}
          />
          <InputField
            label="Size (employees or revenue)"
            value={state.icp.sizeRange ?? ''}
            onChange={value => state.setIcp({ ...state.icp, sizeRange: value })}
          />
          <TextareaField
            label={state.icp.mode === 'b2b' ? 'Regions & buyer roles' : 'Service radius & interest clusters'}
            value={state.icp.mode === 'b2b'
              ? `${state.icp.regions ?? ''}\n${state.icp.targetRoles ?? ''}`
              : `${state.icp.serviceRadius ?? ''}\n${state.icp.interestClusters ?? ''}`}
            onChange={value => {
              const [first = '', second = ''] = value.split('\n');
              if (state.icp.mode === 'b2b') {
                state.setIcp({ ...state.icp, regions: first, targetRoles: second });
              } else {
                state.setIcp({ ...state.icp, serviceRadius: first, interestClusters: second });
              }
            }}
            rows={3}
          />
          <TextareaField
            label={state.icp.mode === 'b2b' ? 'Great-fit companies' : 'Top products / services'}
            value={state.icp.mode === 'b2b' ? state.icp.fitExamples ?? '' : state.icp.topProducts ?? ''}
            onChange={value => state.setIcp({ ...state.icp, [state.icp.mode === 'b2b' ? 'fitExamples' : 'topProducts']: value })}
            rows={2}
          />
          <TextareaField
            label="Exclusions"
            value={state.icp.exclusions ?? ''}
            onChange={value => state.setIcp({ ...state.icp, exclusions: value })}
            rows={2}
          />
        </>
      );
    case 'guardrails':
      return (
        <>
          <SelectField
            label="Outreach pace"
            options={['steady', 'normal', 'aggressive']}
            value={state.outreach.pace}
            onChange={value => state.setOutreach({ ...state.outreach, pace: value as OutreachPolicy['pace'] })}
          />
          <ToggleField
            label="Require approval before the first send"
            checked={state.outreach.requiresApproval}
            onChange={value => state.setOutreach({ ...state.outreach, requiresApproval: value })}
          />
          <CheckboxGroup
            label="Preferred channels"
            options={['Email', 'LinkedIn', 'SMS']}
            values={state.outreach.channels}
            onChange={values => state.setOutreach({ ...state.outreach, channels: values })}
          />
        </>
      );
    case 'reputation':
      return (
        <>
          <CheckboxGroup
            label="Connect review platforms"
            options={['Google', 'Facebook', 'Yelp']}
            values={[state.reputation.connectGoogle ? 'Google' : undefined, state.reputation.connectFacebook ? 'Facebook' : undefined, state.reputation.connectYelp ? 'Yelp' : undefined].filter(Boolean) as string[]}
            onChange={values =>
              state.setReputation({
                ...state.reputation,
                connectGoogle: values.includes('Google'),
                connectFacebook: values.includes('Facebook'),
                connectYelp: values.includes('Yelp'),
              })
            }
          />
          <SelectField
            label="Reply tone"
            options={['grateful', 'concise', 'professional']}
            value={state.reputation.tone}
            onChange={value => state.setReputation({ ...state.reputation, tone: value as ReputationRules['tone'] })}
          />
          <ToggleField
            label="Escalate 1–2 star reviews to Katie"
            checked={state.reputation.escalateLowRatings}
            onChange={value => state.setReputation({ ...state.reputation, escalateLowRatings: value })}
          />
        </>
      );
    case 'success':
      return (
        <>
          <SelectField
            label="Primary KPI"
            options={['Leads', 'Replies', 'Qualifieds', 'Sales', 'Donations']}
            value={state.success.primaryKpi}
            onChange={value => state.setSuccess({ ...state.success, primaryKpi: value })}
          />
          <CheckboxGroup
            label="Reminders"
            options={['Daily digest', 'Weekly summary', 'Only urgent']}
            values={Object.entries(state.success.reminders)
              .filter(([, enabled]) => enabled)
              .map(([key]) => ({ daily: 'Daily digest', weekly: 'Weekly summary', urgentOnly: 'Only urgent' }[key as keyof SuccessPlanV1['reminders']]))}
            onChange={values =>
              state.setSuccess({
                ...state.success,
                reminders: {
                  daily: values.includes('Daily digest'),
                  weekly: values.includes('Weekly summary'),
                  urgentOnly: values.includes('Only urgent'),
                },
              })
            }
          />
        </>
      );
    case 'web':
      return (
        <>
          <ToggleField
            label="Add site widget / lead form"
            checked={state.web.enableLeadForm}
            onChange={value => state.setWeb({ ...state.web, enableLeadForm: value })}
          />
          <InputField
            label="Destination email or tag"
            value={state.web.destination ?? ''}
            onChange={value => state.setWeb({ ...state.web, destination: value })}
            placeholder="concierge@business.com"
          />
          <CheckboxGroup
            label="Integrations"
            options={['Shopify', 'CRM', 'Gmail']}
            values={Object.entries(state.web.integrations)
              .filter(([, enabled]) => enabled)
              .map(([key]) => ({ shopify: 'Shopify', crm: 'CRM', gmail: 'Gmail' }[key as keyof WebSetupPlan['integrations']]))}
            onChange={values =>
              state.setWeb({
                ...state.web,
                integrations: {
                  shopify: values.includes('Shopify'),
                  crm: values.includes('CRM'),
                  gmail: values.includes('Gmail'),
                },
              })
            }
          />
        </>
      );
    default:
      return null;
  }
}

function ChatBubble({ role, agent, children }: { role: 'agent' | 'client'; agent?: Agent; children: ReactNode }) {
  const isClient = role === 'client';
  return (
    <div className={cn('flex w-full items-start gap-3', isClient ? 'justify-end' : 'justify-start')}>
      {!isClient && agent ? <AgentAvatar agent={agent} size={44} /> : null}
      <div
        className={cn(
          'rounded-3xl px-5 py-4 text-sm shadow-sm sm:max-w-xl',
          isClient
            ? 'border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
            : 'bg-slate-900 text-white shadow-md dark:bg-slate-100 dark:text-slate-900',
        )}
      >
        {agent ? (
          <p
            className={cn(
              'text-xs font-semibold uppercase tracking-wide',
              isClient ? 'text-slate-500 dark:text-slate-400' : 'text-white/70 dark:text-slate-500',
            )}
          >
            {agent.name}
          </p>
        ) : null}
        <div className={cn(agent ? 'mt-3' : null)}>{children}</div>
      </div>
      {isClient && agent ? <AgentAvatar agent={agent} size={44} /> : null}
    </div>
  );
}

function StepFooter({ onSkip, onBack, continueLabel }: { onSkip: () => void; onBack?: () => void; continueLabel: string }) {
  return (
    <div className="flex items-center justify-between pt-2">
      <div className="flex gap-2">
        {onBack ? (
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
        ) : null}
        <Button type="button" variant="outline" onClick={onSkip}>
          Skip for now
        </Button>
      </div>
      <Button type="submit">{continueLabel}</Button>
    </div>
  );
}

function TextareaField({ label, value, onChange, placeholder, rows }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; rows?: number }) {
  return (
    <label className="space-y-2 text-sm">
      <span className="text-slate-600 dark:text-slate-300">{label}</span>
      <textarea
        rows={rows ?? 3}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
      />
    </label>
  );
}

function InputField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="space-y-2 text-sm">
      <span className="text-slate-600 dark:text-slate-300">{label}</span>
      <input
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
      />
    </label>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2 text-sm">
      <span className="text-slate-600 dark:text-slate-300">{label}</span>
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
      >
        {options.map(option => (
          <option key={option} value={option}>
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckboxGroup({ label, options, values, onChange }: { label: string; options: string[]; values: string[]; onChange: (values: string[]) => void }) {
  const toggle = (option: string) => {
    onChange(values.includes(option) ? values.filter(item => item !== option) : [...values, option]);
  };
  return (
    <div className="space-y-2 text-sm">
      <span className="text-slate-600 dark:text-slate-300">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map(option => (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={`rounded-full border px-3 py-1 text-xs ${
              values.includes(option)
                ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                : 'border-slate-300 text-slate-500 hover:border-slate-400 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/40">
      <span className="text-slate-600 dark:text-slate-300">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={event => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 dark:border-slate-600 dark:text-slate-100"
      />
    </label>
  );
}

function RecapView({ recap, notes, onNotesChange, onClose }: { recap: OnboardingRecap; notes: string; onNotesChange: (note: string) => void; onClose: () => void }) {
 const rows: Array<{ title: string; content?: string | string[] }> = [
    { title: 'Voice summary', content: recap.voice ? filterStrings([`Tone: ${recap.voice.tone ?? 'Not set'}`, recap.voice.customTone, recap.voice.missionVision]) : undefined },
    { title: 'ICP summary', content: formatIcp(recap.icp) },
    { title: 'Outreach guardrails', content: recap.outreach ? [`Pace: ${recap.outreach.pace}`, recap.outreach.requiresApproval ? 'Requires approval before first send' : 'Auto-send allowed', `Channels: ${recap.outreach.channels.join(', ')}`] : undefined },
    { title: 'Reputation setup', content: recap.reputation ? formatReputation(recap.reputation) : undefined },
    { title: 'KPIs & reminders', content: recap.success ? formatSuccess(recap.success) : undefined },
    { title: 'Web & integrations', content: recap.web ? formatWeb(recap.web) : undefined },
  ];

  return (
    <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300">
      <div className="space-y-2">
        <p>
          Scout has a plan for <span className="font-semibold">{recap.business.name}</span>. Preview the highlights and choose where to begin.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => alert('Preview playbooks coming soon.')}>Preview Playbooks</Button>
          <Button size="sm" onClick={() => alert('Prospecting kickoff queued.')}>Start Prospecting</Button>
          <Button size="sm" variant="outline" onClick={() => alert('Reminder scheduling coming soon.')}>Set Reminders</Button>
        </div>
      </div>
      <div className="space-y-4">
        {rows.map(row => (
          <div key={row.title} className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <p className="font-semibold text-slate-800 dark:text-slate-200">{row.title}</p>
            {renderRecap(row.content)}
          </div>
        ))}
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <p className="font-semibold text-slate-800 dark:text-slate-200">Creative asks</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {recap.creativeAsks.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <label className="block space-y-2">
        <span className="text-slate-600 dark:text-slate-300">Would you like to add anything before we begin?</span>
        <textarea
          value={notes}
          onChange={event => onNotesChange(event.target.value)}
          rows={3}
          placeholder="Add final guidance for the crew"
          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
        />
      </label>
      <footer className="flex justify-end">
        <Button onClick={onClose}>Done</Button>
      </footer>
    </div>
  );
}

function renderRecap(content?: string | string[]) {
  if (!content) return <p className="mt-2 text-slate-500 dark:text-slate-400">Skipped during onboarding.</p>;
  if (Array.isArray(content)) {
    const items = filterStrings(content);
    if (!items.length) return <p className="mt-2 text-slate-500 dark:text-slate-400">Skipped during onboarding.</p>;
    return (
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {items.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  return <p className="mt-2 text-slate-600 dark:text-slate-300">{content}</p>;
}

function filterStrings(values: (string | undefined)[]): string[] {
  return values.filter((item): item is string => Boolean(item && item.trim()));
}

function AgentAvatar({ agent, size = 48 }: { agent: Agent; size?: number }) {
  const dimension = `${size}px`;
  return (
    <Image
      src={getAvatar(agent)}
      alt={`${agent.name}, ${agent.role}`}
      width={size}
      height={size}
      sizes={`(max-width: 640px) ${dimension}, ${dimension}`}
      className="rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
}

function attemptClose(close: () => void) {
  if (window.confirm('Resume later?')) {
    close();
  }
}

function buildRecap(
  business: { id: string; name: string; website?: string; industry?: string },
  data: { voice?: VoiceProfileV1; icp?: ICPv1; outreach?: OutreachPolicy; reputation?: ReputationRules; success?: SuccessPlanV1; web?: WebSetupPlan },
): OnboardingRecap {
  return {
    business,
    voice: data.voice,
    icp: data.icp,
    outreach: data.outreach,
    reputation: data.reputation,
    success: data.success,
    web: data.web,
    playbooks: ['Prospect→Contract Autopilot', 'Authentic Nurture', 'Review Boost'],
    creativeAsks: ['Owner video (30–60s)', 'Three product or service photos', 'Two or three testimonials'],
  };
}

function formatIcp(icp?: ICPv1) {
  if (!icp) return undefined;
  const lines: string[] = [`Mode: ${icp.mode.toUpperCase()}`];
  if (icp.industries) lines.push(`Industries: ${icp.industries}`);
  if (icp.sizeRange) lines.push(`Size: ${icp.sizeRange}`);
  if (icp.mode === 'b2b') {
    if (icp.regions) lines.push(`Regions: ${icp.regions}`);
    if (icp.targetRoles) lines.push(`Buyer roles: ${icp.targetRoles}`);
    if (icp.fitExamples) lines.push(`Great-fit companies: ${icp.fitExamples}`);
  } else {
    if (icp.serviceRadius) lines.push(`Service radius: ${icp.serviceRadius}`);
    if (icp.interestClusters) lines.push(`Interest clusters: ${icp.interestClusters}`);
    if (icp.topProducts) lines.push(`Top products/services: ${icp.topProducts}`);
  }
  if (icp.exclusions) lines.push(`Exclusions: ${icp.exclusions}`);
  return lines;
}

function formatReputation(rules: ReputationRules) {
  return [
    rules.connectGoogle ? 'Google connected' : undefined,
    rules.connectFacebook ? 'Facebook connected' : undefined,
    rules.connectYelp ? 'Yelp connected' : undefined,
    `Reply tone: ${title(rules.tone)}`,
    rules.escalateLowRatings ? 'Escalate low ratings to Katie' : 'No escalations',
  ].filter(Boolean) as string[];
}

function formatSuccess(plan: SuccessPlanV1) {
  const reminders = Object.entries(plan.reminders)
    .filter(([, enabled]) => enabled)
    .map(([key]) => ({ daily: 'Daily digest', weekly: 'Weekly summary', urgentOnly: 'Only urgent' }[key as keyof SuccessPlanV1['reminders']]));
  return [`Primary KPI: ${plan.primaryKpi}`, reminders.length ? `Reminders: ${reminders.join(', ')}` : undefined].filter(Boolean) as string[];
}

function formatWeb(plan: WebSetupPlan) {
  const integrations = Object.entries(plan.integrations)
    .filter(([, enabled]) => enabled)
    .map(([key]) => title(key));
  return [
    plan.enableLeadForm ? 'Lead widget enabled' : 'No lead widget',
    plan.destination ? `Destination: ${plan.destination}` : undefined,
    integrations.length ? `Integrations: ${integrations.join(', ')}` : undefined,
  ].filter(Boolean) as string[];
}

function title(value: string) {
  return value
    .split(/[-_ ]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
