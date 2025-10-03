export interface VoiceProfileV1 {
  missionVision?: string;
  tone?: string;
  customTone?: string;
  doPhrases?: string;
  dontPhrases?: string;
  uploads?: string[];
}

export type ICPMode = 'b2b' | 'b2c';

export interface ICPv1 {
  mode: ICPMode;
  industries?: string;
  sizeRange?: string;
  regions?: string;
  targetRoles?: string;
  fitExamples?: string;
  serviceRadius?: string;
  interestClusters?: string;
  topProducts?: string;
  exclusions?: string;
}

export type OutreachPace = 'steady' | 'normal' | 'aggressive';

export interface OutreachPolicy {
  pace: OutreachPace;
  requiresApproval: boolean;
  channels: string[];
}

export interface ReputationRules {
  connectGoogle: boolean;
  connectFacebook: boolean;
  connectYelp: boolean;
  tone: 'grateful' | 'concise' | 'professional';
  escalateLowRatings: boolean;
}

export interface SuccessPlanV1 {
  primaryKpi: string;
  reminders: {
    daily: boolean;
    weekly: boolean;
    urgentOnly: boolean;
  };
}

export interface WebSetupPlan {
  enableLeadForm: boolean;
  destination?: string;
  integrations: {
    shopify: boolean;
    crm: boolean;
    gmail: boolean;
  };
}

export interface OnboardingRecap {
  business: {
    id: string;
    name: string;
    website?: string;
    industry?: string;
  };
  voice?: VoiceProfileV1;
  icp?: ICPv1;
  outreach?: OutreachPolicy;
  reputation?: ReputationRules;
  success?: SuccessPlanV1;
  web?: WebSetupPlan;
  playbooks: string[];
  creativeAsks: string[];
  notes?: string;
}

export interface OnboardingData {
  voice?: VoiceProfileV1;
  icp?: ICPv1;
  outreach?: OutreachPolicy;
  reputation?: ReputationRules;
  success?: SuccessPlanV1;
  web?: WebSetupPlan;
  notes?: string;
}
