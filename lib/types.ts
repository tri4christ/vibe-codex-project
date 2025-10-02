export type Freshness = 'Hot' | 'Warm' | 'Cold';

export type MemoryFact = {
  id: string;
  key: string;
  label: string;
  status: 'positive' | 'negative' | 'neutral';
  confidence: number;
  source: 'email' | 'news' | 'social' | 'manual';
  lastSeenAt: string;
  snippet?: string;
  useInPersonalization: boolean;
};

export type ContactMemory = {
  contactId: string;
  summary: string;
  traits: {
    interests: string[];
    pains: string[];
    goals: string[];
    preferences: {
      tone?: 'Warm' | 'Direct' | 'Playful';
      cadenceDays?: number;
      channel?: 'email' | 'phone' | 'sms';
      priceSensitivity?: 'Low' | 'Med' | 'High';
    };
  };
  facts: MemoryFact[];
  updatedAt: string;
};

export type SignalItem = {
  id: string;
  kind: 'press' | 'social';
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  takeaway: string;
};

export type TimelineEvent = {
  id: string;
  kind: 'email' | 'social' | 'press' | 'note';
  title: string;
  snippet: string;
  occurredAt: string;
  source: string;
  promoteable: boolean;
};

export type ProspectStage = 'Discovered' | 'Qualified' | 'Pursuing' | 'Proposal' | 'Won' | 'Lost';

export type Priority = 'P1' | 'P2' | 'P3';

export type ProspectBusiness = {
  id: string;
  homeBusinessId: string;
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  region?: string;
  segment?: string;
  source: 'Discovery' | 'Import' | 'Manual';
  owner?: string;
  icpFit: number;
  priority: Priority;
  stage: ProspectStage;
  tags: string[];
  updatedAt: string;
};

export type BuyingRole =
  | 'Decision Maker'
  | 'Economic Buyer'
  | 'Technical Buyer'
  | 'Champion'
  | 'Influencer'
  | 'Blocker';

export type PersonStage = 'New' | 'Nurturing' | 'Qualified' | 'Meeting' | 'Won' | 'Lost';

export type Person = {
  id: string;
  prospectBusinessId: string;
  homeBusinessId: string;
  name: string;
  title?: string;
  email: string;
  phone?: string;
  role?: BuyingRole;
  stage: PersonStage;
  updatedAt: string;
};

export type SetupStatus = 'todo' | 'in-progress' | 'done' | 'blocked' | 'skipped';
export type SetupOwner = 'Scout' | 'Story' | 'Piper' | 'Caleb' | 'Eden' | 'Leo';
export type SetupImpact = 'critical' | 'high' | 'med' | 'low';

export type SetupArtifact = {
  id: string;
  kind: 'text' | 'image' | 'json' | 'link';
  title: string;
  preview: string;
};

export type SetupTask = {
  id: string;
  group: string;
  title: string;
  owner: SetupOwner;
  status: SetupStatus;
  impact: SetupImpact;
  description: string;
  actions: string[];
  requiresApproval?: boolean;
  approved?: boolean;
  lastUpdatedAt: string;
  artifacts?: SetupArtifact[];
  fields?: Record<string, string>;
};

export type MarketingSetup = {
  homeBusinessId: string;
  tasks: SetupTask[];
  activity: { at: string; msg: string }[];
  requiresApproval: boolean;
  completedAt?: string;
};
