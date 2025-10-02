export interface BaseAgent {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly color: string;
  readonly blurb: string;
}

export type Agent =
  | (BaseAgent & {
      readonly kind: 'ai';
      readonly emoji: string;
      readonly avatar?: string;
    })
  | (BaseAgent & {
      readonly kind: 'human';
      readonly avatar: string;
      readonly emoji?: never;
    });

export const AGENTS: readonly Agent[] = [
  {
    id: 'scout',
    name: 'Scout',
    role: 'Prospect navigator',
    kind: 'ai',
    emoji: '🧭',
    color: 'sky-500',
    blurb: 'Maps emerging franchise opportunities before competitors do.',
  },
  {
    id: 'caleb',
    name: 'Caleb',
    role: 'Pipeline mechanic',
    kind: 'ai',
    emoji: '🛠️',
    color: 'amber-500',
    blurb: 'Keeps automations tuned so every lead moves forward on time.',
  },
  {
    id: 'story',
    name: 'Story',
    role: 'Narrative architect',
    kind: 'ai',
    emoji: '📝',
    color: 'rose-500',
    blurb: 'Drafts copy that mirrors each franchise voice across channels.',
  },
  {
    id: 'piper',
    name: 'Piper',
    role: 'Outreach maestro',
    kind: 'ai',
    emoji: '📣',
    color: 'violet-500',
    blurb: 'Manages 1:1 outreach with tone-matched follow ups ready to send.',
  },
  {
    id: 'eden',
    name: 'Eden',
    role: 'Growth analyst',
    kind: 'ai',
    emoji: '📊',
    color: 'emerald-500',
    blurb: 'Models channel mix and spend to keep ROI targets on track.',
  },
  {
    id: 'leo',
    name: 'Leo',
    role: 'Deal closer',
    kind: 'ai',
    emoji: '🤝',
    color: 'indigo-500',
    blurb: 'Preps proposals and anticipates objections before handoff.',
  },
  {
    id: 'katie-elliott',
    name: 'Katie Elliott',
    role: 'Business Director',
    kind: 'human',
    color: 'slate-600',
    avatar: '/agents/katie-elliott.jpg',
    blurb: 'Owns franchise expansion plans and signs off on every rollout.',
  },
  {
    id: 'ezra-elliott',
    name: 'Ezra Elliott',
    role: 'Creative Director',
    kind: 'human',
    color: 'slate-500',
    avatar: '/agents/ezra-elliott.jpg',
    blurb: 'Elevates campaign look-and-feel and protects the master brand.',
  },
] as const;

export function getAvatar(agent: Agent): string {
  return agent.kind === 'human' ? agent.avatar : agent.avatar ?? '/agents/fallback.png';
}
