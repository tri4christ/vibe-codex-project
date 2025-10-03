import type { Agent } from '@/lib/agents';

export type OnboardingSectionId = 'voice' | 'icp' | 'guardrails' | 'reputation' | 'success' | 'web';

export interface OnboardingSection {
  id: OnboardingSectionId;
  agentId: Agent['id'];
  title: string;
  prompts: string[];
}

export const ONBOARDING_SECTIONS: readonly OnboardingSection[] = [
  {
    id: 'voice',
    agentId: 'story',
    title: 'Voice Builder',
    prompts: [
      'Share the mission and vision.',
      'Pick the tone Story should mirror.',
      'Highlight do and don’t phrases.',
      'Drop FAQs, testimonials, or brand docs.',
    ],
  },
  {
    id: 'icp',
    agentId: 'scout',
    title: 'ICP Builder',
    prompts: [
      'Clarify if you sell B2B or B2C.',
      'Outline target industries, regions, and personas.',
      'List great-fit examples or exclusions.',
    ],
  },
  {
    id: 'guardrails',
    agentId: 'caleb',
    title: 'Outreach Guardrails',
    prompts: [
      'Set the outreach pace and guardrails.',
      'Choose the channels and approvals Caleb should respect.',
    ],
  },
  {
    id: 'reputation',
    agentId: 'piper',
    title: 'Reputation Setup',
    prompts: [
      'Connect review platforms Piper should watch.',
      'Pick reply tone and escalation rules.',
    ],
  },
  {
    id: 'success',
    agentId: 'eden',
    title: 'Metrics & Reminders',
    prompts: [
      'Choose the primary KPI Eden should optimise for.',
      'Set the reminder cadence that fits your workflow.',
    ],
  },
  {
    id: 'web',
    agentId: 'leo',
    title: 'Web & Integrations',
    prompts: [
      'Decide on lead capture widgets.',
      'Connect integrations before handoff to Leo.',
    ],
  },
] as const;

export const TOTAL_ONBOARDING_STEPS = ONBOARDING_SECTIONS.length;
