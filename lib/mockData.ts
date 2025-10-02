export type Tier = 'Starter' | 'Growth' | 'Pro';

export type DatasetFormat = 'Text' | 'PDF' | 'JSON';

export type ContactStage = 'Discovery' | 'Enriched' | 'Outreach' | 'Reply' | 'Contracted';

export interface AiAgent {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
}

export interface BusinessMetrics {
  pipelineValue: number;
  contractsSent: number;
  meetingsBooked: number;
  campaignVelocity: number;
}

export interface DatasetEntry {
  id: string;
  name: string;
  format: DatasetFormat;
  description: string;
  uploadedAt: string;
}

export interface CreativeDraft {
  id: string;
  title: string;
  brief: string;
  tone: string;
  cta: string;
  status: 'Draft' | 'Queued' | 'Ready';
}

export interface ContactRecord {
  id: string;
  name: string;
  role: string;
  company: string;
  stage: ContactStage;
  lastTouch: string;
}

export interface ReviewRecord {
  id: string;
  author: string;
  rating: number;
  channel: 'Google' | 'Facebook' | 'Yelp';
  comment: string;
  status: 'Pending' | 'Approved' | 'Responded';
}

export interface PlaybookActivity {
  id: string;
  timestamp: string;
  message: string;
}

export interface BusinessPlaybookState {
  steps: Record<string, 'idle' | 'completed'>;
  activity: PlaybookActivity[];
}

export interface BusinessRecord {
  id: string;
  name: string;
  industry: string;
  website: string;
  tier: Tier;
  goals: string[];
  aiAgentIds: string[];
  metrics: BusinessMetrics;
  contacts: ContactRecord[];
  datasets: DatasetEntry[];
  creativeDrafts: CreativeDraft[];
  reviews: ReviewRecord[];
  playbook: BusinessPlaybookState;
  marketingSetupCompleted?: boolean;
}

export interface PlaybookStep {
  id: string;
  title: string;
  description: string;
  cta: string;
}

export const PLAYBOOK_STEPS: PlaybookStep[] = [
  {
    id: 'discovery',
    title: 'Discovery',
    description: 'Surface new franchise prospects from CRM and regional signals.',
    cta: 'Run discovery'
  },
  {
    id: 'enrich',
    title: 'Enrich',
    description: 'Append firmographics, spend intent, and persona notes.',
    cta: 'Enrich prospects'
  },
  {
    id: 'lookbook',
    title: 'Generate Lookbook',
    description: 'Assemble dynamic collateral tailored to the prospect stack.',
    cta: 'Generate assets'
  },
  {
    id: 'outreach',
    title: 'Outreach',
    description: 'Launch nurture sequence with AI-personalized messaging.',
    cta: 'Send outreach'
  },
  {
    id: 'detect-reply',
    title: 'Detect Reply',
    description: 'Monitor inbox for intent signals and escalate to operator.',
    cta: 'Sync replies'
  },
  {
    id: 'pricing',
    title: 'Auto-Pricing',
    description: 'Score opportunity and draft partner-friendly pricing.',
    cta: 'Generate pricing'
  },
  {
    id: 'contract',
    title: 'Send Contract',
    description: 'Issue ready-to-sign contract packet with negotiated terms.',
    cta: 'Send contract'
  }
];

export const CONTACT_STAGES: ContactStage[] = [
  'Discovery',
  'Enriched',
  'Outreach',
  'Reply',
  'Contracted'
];

export const GOALS_CATALOG: string[] = [
  'Increase franchise leads',
  'Automate outreach sequences',
  'Improve conversion speed',
  'Launch regional campaigns',
  'Strengthen partner retention'
];

export const TIERS: Tier[] = ['Starter', 'Growth', 'Pro'];

export const AI_AGENTS: AiAgent[] = [
  { id: 'scout', name: 'Scout', emoji: '🧭', tagline: 'Prospect navigator and market scout.' },
  { id: 'caleb', name: 'Caleb', emoji: '🛠️', tagline: 'Pipeline mechanic who keeps ops humming.' },
  { id: 'story', name: 'Story', emoji: '📝', tagline: 'Narrative architect for campaigns and copy.' },
  { id: 'piper', name: 'Piper', emoji: '📣', tagline: 'Outreach maestro with tone-matching replies.' },
  { id: 'eden', name: 'Eden', emoji: '📊', tagline: 'Growth analyst optimizing spend vs. impact.' },
  { id: 'leo', name: 'Leo', emoji: '🤝', tagline: 'Deal closer who handles final negotiations.' }
];

export const TIER_AGENT_MAP: Record<Tier, string[]> = {
  Starter: ['scout', 'story', 'piper'],
  Growth: ['scout', 'caleb', 'story', 'piper'],
  Pro: ['scout', 'caleb', 'story', 'piper', 'eden', 'leo']
};

const basePlaybook: Record<string, 'idle'> = PLAYBOOK_STEPS.reduce(
  (acc, step) => {
    acc[step.id] = 'idle';
    return acc;
  },
  {} as Record<string, 'idle'>
);

export function createPlaybookState(seedMessage: string): BusinessPlaybookState {
  return {
    steps: { ...basePlaybook },
    activity: [
      {
        id: 'log-init',
        timestamp: '08:00',
        message: seedMessage
      }
    ]
  };
}

export const INITIAL_BUSINESSES: BusinessRecord[] = [
  {
    id: 'harbor-counseling',
    name: 'Harbor Counseling Collective',
    industry: 'Mental health and wellness',
    website: 'https://harborcounsel.com',
    tier: 'Growth',
    goals: ['Increase franchise leads', 'Automate outreach sequences'],
    aiAgentIds: ['scout', 'caleb', 'story', 'piper'],
    metrics: {
      pipelineValue: 182000,
      contractsSent: 12,
      meetingsBooked: 28,
      campaignVelocity: 62
    },
    contacts: [
      {
        id: 'contact-1',
        name: 'Marisa Lane',
        role: 'Regional Director',
        company: 'Tranquil Minds',
        stage: 'Discovery',
        lastTouch: '2h ago'
      },
      {
        id: 'contact-2',
        name: 'Andre Castillo',
        role: 'Owner',
        company: 'Clear Path Counseling',
        stage: 'Outreach',
        lastTouch: '1d ago'
      },
      {
        id: 'contact-3',
        name: 'Priya Ahmed',
        role: 'Program Coordinator',
        company: 'Renew Therapy',
        stage: 'Enriched',
        lastTouch: '4h ago'
      }
    ],
    datasets: [
      {
        id: 'dataset-1',
        name: 'Harbor Intake Transcripts',
        format: 'Text',
        description: 'Anonymized consult call transcripts from Q1.',
        uploadedAt: 'May 5'
      },
      {
        id: 'dataset-2',
        name: 'Regional Wellbeing Report',
        format: 'PDF',
        description: 'State of mental health partners in coastal markets.',
        uploadedAt: 'Apr 18'
      }
    ],
    creativeDrafts: [
      {
        id: 'creative-1',
        title: 'Spring Wellness Campaign',
        brief: 'Highlight teletherapy convenience for busy caregivers.',
        tone: 'Warm',
        cta: 'Book a Discovery Call',
        status: 'Draft'
      },
      {
        id: 'creative-2',
        title: 'Partner Onboarding Giveaway',
        brief: 'Incentivize new franchises with onboarding package.',
        tone: 'Upbeat',
        cta: 'Claim Onboarding Kit',
        status: 'Queued'
      }
    ],
    reviews: [
      {
        id: 'review-1',
        author: 'Dana P.',
        rating: 5,
        channel: 'Google',
        comment: 'The AI outreach warmed leads before I even called.',
        status: 'Pending'
      },
      {
        id: 'review-2',
        author: 'Marcus V.',
        rating: 4,
        channel: 'Facebook',
        comment: 'Creo AI keeps the team aligned around the next steps.',
        status: 'Responded'
      }
    ],
    playbook: createPlaybookState('Creo AI playbook primed for Prospect to Contract autopilot.'),
    marketingSetupCompleted: false
  },
  {
    id: 'northwind-outfitters',
    name: 'Northwind Outfitters',
    industry: 'Outdoor apparel retail',
    website: 'https://northwindoutfitters.com',
    tier: 'Starter',
    goals: ['Launch regional campaigns'],
    aiAgentIds: ['scout', 'story', 'piper'],
    metrics: {
      pipelineValue: 94000,
      contractsSent: 5,
      meetingsBooked: 14,
      campaignVelocity: 48
    },
    contacts: [
      {
        id: 'contact-4',
        name: 'Logan Price',
        role: 'Franchise Coordinator',
        company: 'Summit Ridge Retail',
        stage: 'Outreach',
        lastTouch: '30m ago'
      },
      {
        id: 'contact-5',
        name: 'Julia Chen',
        role: 'Expansion Lead',
        company: 'Trailblaze Co.',
        stage: 'Discovery',
        lastTouch: '3d ago'
      },
      {
        id: 'contact-6',
        name: 'Tomas Rivera',
        role: 'Operations VP',
        company: 'Mountain Loop Retail',
        stage: 'Reply',
        lastTouch: '1h ago'
      }
    ],
    datasets: [
      {
        id: 'dataset-3',
        name: 'Foot Traffic Heatmap',
        format: 'JSON',
        description: 'Store level engagement metrics from loyalty app.',
        uploadedAt: 'Apr 30'
      }
    ],
    creativeDrafts: [
      {
        id: 'creative-3',
        title: 'Trail to Retail Story',
        brief: 'Feature local franchise success in the mountain region.',
        tone: 'Adventurous',
        cta: 'Start a Gear Fitting Event',
        status: 'Draft'
      }
    ],
    reviews: [
      {
        id: 'review-3',
        author: 'Imani W.',
        rating: 5,
        channel: 'Google',
        comment: 'From lookbook to signed deal in two weeks flat.',
        status: 'Approved'
      }
    ],
    playbook: createPlaybookState('Autopilot configured with retail expansion heuristics.'),
    marketingSetupCompleted: false
  },
  {
    id: 'brightsteps-foundation',
    name: 'BrightSteps Foundation',
    industry: 'Nonprofit youth programs',
    website: 'https://brightsteps.org',
    tier: 'Pro',
    goals: ['Increase franchise leads', 'Improve conversion speed', 'Strengthen partner retention'],
    aiAgentIds: ['scout', 'caleb', 'story', 'piper', 'eden', 'leo'],
    metrics: {
      pipelineValue: 238000,
      contractsSent: 17,
      meetingsBooked: 36,
      campaignVelocity: 71
    },
    contacts: [
      {
        id: 'contact-7',
        name: 'Selena Ortiz',
        role: 'Program Director',
        company: 'Future Voices Alliance',
        stage: 'Enriched',
        lastTouch: '5h ago'
      },
      {
        id: 'contact-8',
        name: 'Derrick Moore',
        role: 'Community Lead',
        company: 'Youth Forward',
        stage: 'Outreach',
        lastTouch: '6h ago'
      },
      {
        id: 'contact-9',
        name: 'Hannah Kim',
        role: 'Board Chair',
        company: 'Future First Youth',
        stage: 'Reply',
        lastTouch: '45m ago'
      }
    ],
    datasets: [
      {
        id: 'dataset-4',
        name: 'Grant Success Stories',
        format: 'Text',
        description: 'Narratives from partners describing funded impact.',
        uploadedAt: 'Apr 22'
      },
      {
        id: 'dataset-5',
        name: 'Program Outcome Dashboard',
        format: 'PDF',
        description: 'Yearly program metrics for youth engagement.',
        uploadedAt: 'Mar 28'
      }
    ],
    creativeDrafts: [
      {
        id: 'creative-4',
        title: 'Impact Week Spotlight',
        brief: 'Highlight multi-city volunteer outcomes.',
        tone: 'Inspiring',
        cta: 'Book a Vision Session',
        status: 'Ready'
      },
      {
        id: 'creative-5',
        title: 'Donor Welcome Kit',
        brief: 'Onboard new partners with AI-personalized materials.',
        tone: 'Grateful',
        cta: 'Plan a Kickoff',
        status: 'Draft'
      }
    ],
    reviews: [
      {
        id: 'review-4',
        author: 'Lydia S.',
        rating: 5,
        channel: 'Facebook',
        comment: 'Creo AI keeps our mission front and center in every message.',
        status: 'Pending'
      },
      {
        id: 'review-5',
        author: 'Gerald N.',
        rating: 4,
        channel: 'Google',
        comment: 'Contract autopilot shaved days off our onboarding.',
        status: 'Pending'
      }
    ],
    playbook: createPlaybookState('Full autopilot enabled with nonprofit partnership signals.'),
    marketingSetupCompleted: false
  }
];
