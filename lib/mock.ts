import { INITIAL_BUSINESSES } from '@/lib/mockData';
import type {
  ContactMemory,
  MemoryFact,
  SignalItem,
  TimelineEvent,
  Freshness,
  ProspectBusiness,
  Person,
} from '@/lib/types';

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export function freshness(dateISO: string): Freshness {
  const now = Date.now();
  const lastSeen = new Date(dateISO).getTime();
  const diffDays = Math.floor((now - lastSeen) / (1000 * 60 * 60 * 24));
  if (diffDays <= 14) return 'Hot';
  if (diffDays <= 60) return 'Warm';
  return 'Cold';
}

export function freshnessColor(label: Freshness): string {
  switch (label) {
    case 'Hot':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200';
    case 'Warm':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200';
    default:
      return 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200';
  }
}

function buildFact(partial: Omit<MemoryFact, 'useInPersonalization'>): MemoryFact {
  const label = freshness(partial.lastSeenAt);
  return {
    ...partial,
    useInPersonalization: label !== 'Cold' && partial.confidence >= 0.6,
  };
}

const [harbor, northwind, brightsteps] = INITIAL_BUSINESSES;

export const MEMORIES: Record<string, ContactMemory> = {
  'contact-1': {
    contactId: 'contact-1',
    summary:
      'Marisa is leaning into community mental health programs and wants ready-to-send nurture copy. She responds best to friendly check-ins and prefers weekly touchpoints.',
    updatedAt: daysAgo(3),
    traits: {
      interests: ['Community partnerships', "Teletherapy onboarding"],
      pains: ['Limited copywriting bandwidth'],
      goals: ['Expand regional referrals'],
      preferences: {
        tone: 'Warm',
        cadenceDays: 7,
        channel: 'email',
        priceSensitivity: 'Med',
      },
    },
    facts: [
      buildFact({
        id: 'fact-marisa-interest-shorts',
        key: 'interest:community-events',
        label: 'Interested in community wellness events',
        status: 'positive',
        confidence: 0.82,
        source: 'email',
        lastSeenAt: daysAgo(2),
        snippet: '“Can we include a callout for the mindfulness meetup next week?”',
      }),
      buildFact({
        id: 'fact-marisa-avoid-long-copy',
        key: 'pain:lengthy-copy',
        label: 'Does not want long-form educational copy',
        status: 'negative',
        confidence: 0.74,
        source: 'email',
        lastSeenAt: daysAgo(28),
        snippet: '“Shorten the intro — folks skim these emails.”',
      }),
      buildFact({
        id: 'fact-marisa-timing',
        key: 'timing:next-week',
        label: 'Prefers next outreach early next week',
        status: 'neutral',
        confidence: 0.66,
        source: 'email',
        lastSeenAt: daysAgo(1),
        snippet: '“Circle back after Monday’s staffing standup.”',
      }),
    ],
  },
  'contact-4': {
    contactId: 'contact-4',
    summary:
      'Logan tracks franchise KPIs closely and is shopping for turnkey launch kits. Keep messaging energetic and offer pricing transparency.',
    updatedAt: daysAgo(9),
    traits: {
      interests: ['Trail-to-retail storytelling', 'Launch playbooks'],
      pains: ['Seasonal inventory risks'],
      goals: ['Increase conversion speed'],
      preferences: {
        tone: 'Direct',
        cadenceDays: 5,
        channel: 'email',
        priceSensitivity: 'Low',
      },
    },
    facts: [
      buildFact({
        id: 'fact-logan-interests',
        key: 'interest:trail-events',
        label: 'Interested in trail-to-retail partner stories',
        status: 'positive',
        confidence: 0.88,
        source: 'email',
        lastSeenAt: daysAgo(4),
        snippet: '“Love that Fieldhouse spotlight — send more of those.”',
      }),
      buildFact({
        id: 'fact-logan-no-women',
        key: 'negative:womens-apparel',
        label: 'Not prioritizing women’s apparel promos',
        status: 'negative',
        confidence: 0.71,
        source: 'email',
        lastSeenAt: daysAgo(33),
      }),
      buildFact({
        id: 'fact-logan-pricing',
        key: 'timing:pricing-next-week',
        label: 'Needs pricing scenarios by next Wednesday',
        status: 'neutral',
        confidence: 0.69,
        source: 'email',
        lastSeenAt: daysAgo(5),
      }),
    ],
  },
  'contact-7': {
    contactId: 'contact-7',
    summary:
      'Selena champions youth program storytelling and values collaborative planning. She responds to inspiring language and social proof from other nonprofits.',
    updatedAt: daysAgo(12),
    traits: {
      interests: ['Volunteer impact stories', 'Grant outcomes'],
      pains: ['Limited design staff'],
      goals: ['Nurture board-ready materials'],
      preferences: {
        tone: 'Playful',
        cadenceDays: 10,
        channel: 'email',
        priceSensitivity: 'High',
      },
    },
    facts: [
      buildFact({
        id: 'fact-selena-impact',
        key: 'interest:impact-week',
        label: 'Eager to spotlight Impact Week volunteers',
        status: 'positive',
        confidence: 0.79,
        source: 'social',
        lastSeenAt: daysAgo(7),
      }),
      buildFact({
        id: 'fact-selena-budget',
        key: 'pain:budget-tight',
        label: 'Budget approvals take extra cycles',
        status: 'negative',
        confidence: 0.63,
        source: 'email',
        lastSeenAt: daysAgo(58),
      }),
      buildFact({
        id: 'fact-selena-board',
        key: 'goal:board-digest',
        label: 'Wants a board-ready digest before each quarter',
        status: 'neutral',
        confidence: 0.72,
        source: 'manual',
        lastSeenAt: daysAgo(18),
      }),
    ],
  },
};

export const CONTACT_TIMELINES: Record<string, TimelineEvent[]> = {
  'contact-1': [
    {
      id: 'timeline-1-email',
      kind: 'email',
      title: 'Replied: “Include mindfulness meetup assets”',
      snippet: 'Marisa wants next outreach to focus on the new wellness meetup.',
      occurredAt: daysAgo(2),
      source: 'Inbox',
      promoteable: true,
    },
    {
      id: 'timeline-1-press',
      kind: 'press',
      title: 'Local press: Coastal wellness grants announced',
      snippet: 'Regional outlets highlight funding available for mental health partners.',
      occurredAt: daysAgo(8),
      source: 'Harbor Newswire',
      promoteable: true,
    },
    {
      id: 'timeline-1-note',
      kind: 'note',
      title: 'Manual note added by Scout',
      snippet: 'Schedule recap email after staffing standup.',
      occurredAt: daysAgo(1),
      source: 'Creo AI',
      promoteable: true,
    },
  ],
  'contact-4': [
    {
      id: 'timeline-4-email',
      kind: 'email',
      title: 'Replied: “Need transparent pricing decks”',
      snippet: 'Logan asked for clear rollout pricing scenarios.',
      occurredAt: daysAgo(5),
      source: 'Inbox',
      promoteable: true,
    },
    {
      id: 'timeline-4-social',
      kind: 'social',
      title: 'Shared trail clean-up recap on LinkedIn',
      snippet: 'Northwind posted about community impact weekend.',
      occurredAt: daysAgo(3),
      source: 'LinkedIn',
      promoteable: true,
    },
    {
      id: 'timeline-4-note',
      kind: 'note',
      title: 'Manual: Pricing scenario draft saved',
      snippet: 'Creo AI autopilot prepared two pricing tiers.',
      occurredAt: daysAgo(2),
      source: 'Creo AI',
      promoteable: false,
    },
  ],
  'contact-7': [
    {
      id: 'timeline-7-email',
      kind: 'email',
      title: 'Replied: “Board wants an impact digest”',
      snippet: 'Selena highlighted board appetite for quarterly highlight reels.',
      occurredAt: daysAgo(18),
      source: 'Inbox',
      promoteable: true,
    },
    {
      id: 'timeline-7-press',
      kind: 'press',
      title: 'Nonprofit Times: BrightSteps wins innovation grant',
      snippet: 'Coverage mentions program expansion to three cities.',
      occurredAt: daysAgo(11),
      source: 'Nonprofit Times',
      promoteable: true,
    },
    {
      id: 'timeline-7-social',
      kind: 'social',
      title: 'Shared volunteer spotlight on Instagram',
      snippet: 'Youth volunteers featured in Impact Week recap.',
      occurredAt: daysAgo(6),
      source: 'Instagram',
      promoteable: true,
    },
  ],
};

export const COMPANY_SIGNALS: Record<string, SignalItem[]> = {
  [harbor.id]: [
    {
      id: 'signal-harbor-press',
      kind: 'press',
      title: 'Coastal Beacon covers Harbor Counseling’s hybrid expansion',
      source: 'Coastal Beacon',
      url: 'https://news.example.com/harbor-hybrid',
      publishedAt: daysAgo(4),
      takeaway: 'Highlights rapid demand for teletherapy partnerships.',
    },
    {
      id: 'signal-harbor-social',
      kind: 'social',
      title: 'Instagram: Wellness meetup teaser video',
      source: 'Instagram',
      url: 'https://social.example.com/harbor-meetup',
      publishedAt: daysAgo(1),
      takeaway: 'Signals upcoming event focus for campaigns.',
    },
  ],
  [northwind.id]: [
    {
      id: 'signal-northwind-press',
      kind: 'press',
      title: 'Outdoor Retail Weekly: Northwind’s franchise kit sells out',
      source: 'Outdoor Retail Weekly',
      url: 'https://news.example.com/northwind-kit',
      publishedAt: daysAgo(9),
      takeaway: 'Shows urgency for restock messaging.',
    },
    {
      id: 'signal-northwind-social',
      kind: 'social',
      title: 'LinkedIn: Trail clean-up community recap',
      source: 'LinkedIn',
      url: 'https://social.example.com/northwind-trail',
      publishedAt: daysAgo(2),
      takeaway: 'Great hook for community-focused outreach.',
    },
  ],
  [brightsteps.id]: [
    {
      id: 'signal-bright-press',
      kind: 'press',
      title: 'City Chronicle: BrightSteps expands Impact Week',
      source: 'City Chronicle',
      url: 'https://news.example.com/brightsteps-impact',
      publishedAt: daysAgo(7),
      takeaway: 'Underscores momentum with volunteer programs.',
    },
    {
      id: 'signal-bright-social',
      kind: 'social',
      title: 'Twitter: Thank you donors shoutout',
      source: 'Twitter',
      url: 'https://social.example.com/brightsteps-donors',
      publishedAt: daysAgo(3),
      takeaway: 'Signals strong donor engagement to reference.',
    },
  ],
};

export const PROSPECT_BUSINESSES: ProspectBusiness[] = [
  {
    id: 'prospect-harbor-1',
    homeBusinessId: harbor.id,
    name: 'CalmSeas Therapeutics',
    website: 'https://calmseashealth.com',
    industry: 'Mental Health Clinics',
    size: '25-60',
    region: 'Pacific Northwest',
    segment: 'Urban wellness',
    source: 'Discovery',
    owner: 'Scout',
    icpFit: 82,
    priority: 'P1',
    stage: 'Qualified',
    tags: ['Teletherapy', 'Corporate partnerships'],
    updatedAt: daysAgo(3),
  },
  {
    id: 'prospect-harbor-2',
    homeBusinessId: harbor.id,
    name: 'BetterBalance Clinics',
    website: 'https://betterbalance.org',
    industry: 'Outpatient therapy',
    size: '10-30',
    region: 'California',
    segment: 'Coastal',
    source: 'Manual',
    owner: 'Story',
    icpFit: 68,
    priority: 'P2',
    stage: 'Pursuing',
    tags: ['Mindfulness', 'Community'],
    updatedAt: daysAgo(7),
  },
  {
    id: 'prospect-northwind-1',
    homeBusinessId: northwind.id,
    name: 'Summit Trails Retail',
    website: 'https://summittrailsretail.com',
    industry: 'Outdoor Retail',
    size: '50-120',
    region: 'Rocky Mountains',
    segment: 'Resort towns',
    source: 'Import',
    owner: 'Caleb',
    icpFit: 75,
    priority: 'P1',
    stage: 'Proposal',
    tags: ['Seasonal kits', 'Trail events'],
    updatedAt: daysAgo(5),
  },
];

export const PEOPLE: Person[] = [
  {
    id: 'contact-1',
    prospectBusinessId: 'prospect-harbor-1',
    homeBusinessId: harbor.id,
    name: 'Marisa Lane',
    title: 'Regional Director',
    email: 'marisa@calmseashealth.com',
    phone: '+1-555-0144',
    role: 'Decision Maker',
    stage: 'Qualified',
    updatedAt: daysAgo(2),
  },
  {
    id: 'contact-2',
    prospectBusinessId: 'prospect-harbor-2',
    homeBusinessId: harbor.id,
    name: 'Andre Castillo',
    title: 'Owner',
    email: 'andre@betterbalance.org',
    phone: '+1-555-0181',
    role: 'Economic Buyer',
    stage: 'Nurturing',
    updatedAt: daysAgo(4),
  },
  {
    id: 'contact-4',
    prospectBusinessId: 'prospect-northwind-1',
    homeBusinessId: northwind.id,
    name: 'Logan Price',
    title: 'Franchise Coordinator',
    email: 'logan@summittrailsretail.com',
    role: 'Champion',
    stage: 'Meeting',
    updatedAt: daysAgo(3),
  },
];
