"use client";

import { createContext, useContext, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { INITIAL_BUSINESSES, type BusinessRecord, type ContactRecord } from '@/lib/mockData';
import {
  COMPANY_SIGNALS,
  CONTACT_TIMELINES,
  MEMORIES,
  PROSPECT_BUSINESSES,
  PEOPLE,
  freshness,
} from '@/lib/mock';
import type {
  ContactMemory,
  MemoryFact,
  SignalItem,
  TimelineEvent,
  ProspectBusiness,
  Person,
  MarketingSetup,
  SetupTask,
  SetupArtifact,
} from '@/lib/types';

interface PromotePayload {
  event: TimelineEvent;
  status: MemoryFact['status'];
  confidence: number;
  label?: string;
}

interface CreoStoreValue {
  businesses: BusinessRecord[];
  setBusinesses: Dispatch<SetStateAction<BusinessRecord[]>>;
  activeHomeBusinessId: string;
  setActiveHomeBusinessId: (id: string) => void;
  memories: Record<string, ContactMemory>;
  setMemories: Dispatch<SetStateAction<Record<string, ContactMemory>>>;
  companySignals: Record<string, SignalItem[]>;
  contactTimelines: Record<string, TimelineEvent[]>;
  prospects: ProspectBusiness[];
  setProspects: Dispatch<SetStateAction<ProspectBusiness[]>>;
  people: Person[];
  setPeople: Dispatch<SetStateAction<Person[]>>;
  saveProfileTraits: (contactId: string, traits: ContactMemory['traits']) => void;
  toggleFactUse: (contactId: string, factId: string, useInPersonalization: boolean) => void;
  editFact: (contactId: string, factId: string, patch: Partial<Omit<MemoryFact, 'id'>>) => void;
  deleteFact: (contactId: string, factId: string) => void;
  promoteEventToFact: (contactId: string, payload: PromotePayload) => void;
  regenerateSummary: (contactId: string) => void;
  appendPricingFact: (contact: ContactRecord) => void;
  addProspect: (prospect: ProspectBusiness) => void;
  updateProspect: (id: string, patch: Partial<ProspectBusiness>) => void;
  addPerson: (person: Person) => void;
  updatePerson: (id: string, patch: Partial<Person>) => void;
  movePersonToProspect: (personId: string, prospectBusinessId: string) => void;
  findPeopleByProspect: (prospectId: string) => Person[];
  marketingSetups: MarketingSetup[];
  marketingSetupDismissed: Record<string, boolean>;
  startMarketingSetup: (homeBusinessId: string) => void;
  updateSetupTask: (homeBusinessId: string, taskId: string, patch: Partial<SetupTask>) => void;
  addSetupArtifact: (homeBusinessId: string, taskId: string, artifact: SetupArtifact) => void;
  logSetup: (homeBusinessId: string, message: string) => void;
  computeMarketingHealth: (homeBusinessId: string) => { score: number; band: 'red' | 'amber' | 'green' };
  setMarketingRequiresApproval: (homeBusinessId: string, requiresApproval: boolean) => void;
  markMarketingSetupComplete: (homeBusinessId: string) => void;
  dismissMarketingSetupReminder: (homeBusinessId: string) => void;
}

const CreoStoreContext = createContext<CreoStoreValue | undefined>(undefined);

const SETUP_IMPACT_WEIGHTS: Record<'critical' | 'high' | 'med' | 'low', number> = {
  critical: 4,
  high: 3,
  med: 2,
  low: 1,
};

type TaskBlueprint = Omit<SetupTask, 'status' | 'artifacts' | 'approved' | 'lastUpdatedAt' | 'fields'> & {
  fields?: Record<string, string>;
};

const TASK_BLUEPRINTS: TaskBlueprint[] = [
  {
    id: 'identity-google-business-profile',
    group: 'Identity & Presence',
    title: 'Google Business Profile',
    owner: 'Piper',
    impact: 'critical',
    description: 'Claim the listing, verify the business, and ensure profile completeness.',
    actions: ['Open', 'Mark done'],
    fields: {
      businessName: '',
      category: '',
      address: '',
      phone: '',
      hours: 'Mon-Fri: 9am-5pm; Sat: 10am-2pm; Sun: Closed',
    },
  },
  {
    id: 'identity-apple-bing-places',
    group: 'Identity & Presence',
    title: 'Apple Maps & Bing Places',
    owner: 'Piper',
    impact: 'high',
    description: 'Create or update location listings across Apple Maps and Bing Places.',
    actions: ['Open', 'Mark done'],
  },
  {
    id: 'identity-nap-consistency',
    group: 'Identity & Presence',
    title: 'NAP Consistency & Hours',
    owner: 'Caleb',
    impact: 'critical',
    description: 'Align name, address, phone, and operating hours across every property.',
    actions: ['Validate', 'Fix', 'Mark done'],
    fields: {
      name: '',
      address: '',
      phone: '',
      hoursMonFri: '9am-5pm',
      hoursSat: '10am-2pm',
      hoursSun: 'Closed',
    },
  },
  {
    id: 'identity-social-handle-audit',
    group: 'Identity & Presence',
    title: 'Social Handle Audit',
    owner: 'Leo',
    impact: 'med',
    description: 'Review availability of priority social handles and reserve if open.',
    actions: ['Suggest', 'Reserve', 'Mark done'],
    fields: {
      desiredHandle: '',
      availability: 'Facebook: Available\nInstagram: Taken\nTwitter: Available',
    },
  },
  {
    id: 'seo-homepage-metadata',
    group: 'Website & SEO',
    title: 'Homepage Metadata',
    owner: 'Story',
    impact: 'critical',
    description: 'Generate optimized title and meta description aligned to local SEO goals.',
    actions: ['Scan', 'Generate tags', 'Approve'],
    requiresApproval: true,
    fields: {
      metaTitle: '',
      metaDescription: '',
    },
  },
  {
    id: 'seo-local-keywords',
    group: 'Website & SEO',
    title: 'Local Keywords Seed',
    owner: 'Scout',
    impact: 'high',
    description: 'Build a starter list of local and service keywords for content expansion.',
    actions: ['Suggest', 'Add'],
    fields: {
      keywords: 'wellness coaching, coastal therapy, virtual counseling',
    },
  },
  {
    id: 'seo-localbusiness-schema',
    group: 'Website & SEO',
    title: 'LocalBusiness Schema (JSON-LD)',
    owner: 'Leo',
    impact: 'high',
    description: 'Generate structured data to boost local search appearance.',
    actions: ['Generate', 'Preview', 'Approve'],
    requiresApproval: true,
    fields: {
      json: '{\n  "@context": "https://schema.org",\n  "@type": "LocalBusiness"\n}',
    },
  },
  {
    id: 'seo-mobile-speed-snapshot',
    group: 'Website & SEO',
    title: 'Mobile & Speed Snapshot',
    owner: 'Eden',
    impact: 'med',
    description: 'Capture Lighthouse-style insights for mobile readiness and speed.',
    actions: ['Run', 'Mark done'],
  },
  {
    id: 'reviews-review-links',
    group: 'Reviews & Reputation',
    title: 'Review Links Setup',
    owner: 'Piper',
    impact: 'critical',
    description: 'Generate direct review request links for Google, Yelp, and Facebook.',
    actions: ['Generate', 'Copy', 'Mark done'],
    fields: {
      google: 'https://g.page/example-review',
      yelp: 'https://yelp.com/biz/example',
    },
  },
  {
    id: 'reviews-request-templates',
    group: 'Reviews & Reputation',
    title: 'Request Templates (Email/SMS)',
    owner: 'Story',
    impact: 'high',
    description: 'Draft outreach templates for collecting reviews via email and SMS.',
    actions: ['Draft', 'Approve'],
    requiresApproval: true,
    fields: {
      emailTemplate: 'Hi {{name}}, would you mind sharing feedback?',
      smsTemplate: 'Thanks for visiting! Drop us a quick review here: {{link}}',
    },
  },
  {
    id: 'reviews-baseline-reputation',
    group: 'Reviews & Reputation',
    title: 'Baseline Reputation',
    owner: 'Eden',
    impact: 'med',
    description: 'Log current sentiment and rating averages across platforms.',
    actions: ['Scan', 'Log'],
  },
  {
    id: 'reviews-competitor-comparison',
    group: 'Reviews & Reputation',
    title: 'Competitor Comparison',
    owner: 'Eden',
    impact: 'low',
    description: 'Benchmark review volume and sentiment against nearby competitors.',
    actions: ['Run', 'View'],
  },
  {
    id: 'branding-logo-photo',
    group: 'Branding & Creative',
    title: 'Logo & Photo Check',
    owner: 'Story',
    impact: 'high',
    description: 'Review brand assets for quality and consistency across touchpoints.',
    actions: ['Upload', 'Assess', 'Mark done'],
  },
  {
    id: 'branding-social-banner-pack',
    group: 'Branding & Creative',
    title: 'Social Banner Pack',
    owner: 'Leo',
    impact: 'med',
    description: 'Generate ready-to-use social header graphics in required dimensions.',
    actions: ['Generate', 'Download'],
  },
  {
    id: 'branding-elevator-pitch',
    group: 'Branding & Creative',
    title: 'Elevator Pitch & About Us',
    owner: 'Story',
    impact: 'high',
    description: 'Draft concise messaging for the homepage and sales collateral.',
    actions: ['Draft', 'Approve'],
    requiresApproval: true,
    fields: {
      elevatorPitch: '',
      aboutUs: '',
    },
  },
  {
    id: 'communication-cta-presence',
    group: 'Communication Setup',
    title: 'CTA Presence',
    owner: 'Caleb',
    impact: 'critical',
    description: 'Ensure every key page has a clear call-to-action.',
    actions: ['Check', 'Fix', 'Mark done'],
    fields: {
      homepageCTA: 'Book a Session',
      contactCTA: 'Call Now',
    },
  },
  {
    id: 'communication-lead-capture-test',
    group: 'Communication Setup',
    title: 'Lead Capture Test',
    owner: 'Caleb',
    impact: 'high',
    description: 'Simulate a form submission and confirm notifications trigger.',
    actions: ['Simulate', 'Log'],
  },
  {
    id: 'communication-email-signatures',
    group: 'Communication Setup',
    title: 'Email Signatures Kit',
    owner: 'Leo',
    impact: 'med',
    description: 'Generate branded signatures for the team to deploy.',
    actions: ['Generate', 'Download'],
  },
  {
    id: 'data-faq-knowledge-base',
    group: 'Data & AI Readiness',
    title: 'FAQ / Knowledge Base',
    owner: 'Story',
    impact: 'high',
    description: 'Draft top questions and answers for AI personalization and support.',
    actions: ['Draft', 'Approve'],
    requiresApproval: true,
    fields: {
      faqs: 'Q: What areas do you serve?\nA: Coastal counties',
    },
  },
  {
    id: 'data-social-listening-hooks',
    group: 'Data & AI Readiness',
    title: 'Social Listening Hooks',
    owner: 'Scout',
    impact: 'med',
    description: 'Enable keyword alerts and location monitoring for social mentions.',
    actions: ['Suggest', 'Enable', 'Mark done'],
  },
  {
    id: 'data-sentiment-baseline',
    group: 'Data & AI Readiness',
    title: 'Sentiment Baseline',
    owner: 'Eden',
    impact: 'med',
    description: 'Capture current sentiment score to track lift after campaigns.',
    actions: ['Run', 'View'],
  },
  {
    id: 'compliance-privacy-terms',
    group: 'Compliance & Trust',
    title: 'Privacy Policy & Terms',
    owner: 'Caleb',
    impact: 'high',
    description: 'Generate compliant policy and terms pages for the website.',
    actions: ['Generate', 'Approve'],
    requiresApproval: true,
  },
  {
    id: 'compliance-ssl-check',
    group: 'Compliance & Trust',
    title: 'SSL Check',
    owner: 'Eden',
    impact: 'med',
    description: 'Verify SSL certificate and expiration date across environments.',
    actions: ['Verify', 'Mark done'],
  },
  {
    id: 'compliance-accessibility',
    group: 'Compliance & Trust',
    title: 'Accessibility Checklist',
    owner: 'Leo',
    impact: 'med',
    description: 'Run accessibility scan and flag issues for remediation.',
    actions: ['Run', 'Mark done'],
  },
  {
    id: 'wow-intro-reel-storyboard',
    group: 'Wow Add-ons',
    title: 'Intro Reel Storyboard (30s)',
    owner: 'Story',
    impact: 'low',
    description: 'Draft a quick storyboard for a 30-second launch reel.',
    actions: ['Draft', 'Download'],
  },
  {
    id: 'wow-qr-codes',
    group: 'Wow Add-ons',
    title: 'QR Codes (Booking/Reviews)',
    owner: 'Leo',
    impact: 'med',
    description: 'Generate QR codes for booking links and review requests.',
    actions: ['Generate', 'Download'],
  },
  {
    id: 'wow-social-post-starter-kit',
    group: 'Wow Add-ons',
    title: 'Social Post Starter Kit (10)',
    owner: 'Story',
    impact: 'med',
    description: 'Draft ten ready-to-use social post captions with image notes.',
    actions: ['Draft', 'Approve'],
    requiresApproval: true,
  },
  {
    id: 'wow-welcome-email-sequence',
    group: 'Wow Add-ons',
    title: 'Welcome Email Sequence (3)',
    owner: 'Story',
    impact: 'med',
    description: 'Draft a three-touch welcome sequence for new leads.',
    actions: ['Draft', 'Approve'],
    requiresApproval: true,
  },
];

function createDefaultTasks(): SetupTask[] {
  const now = new Date().toISOString();
  return TASK_BLUEPRINTS.map(blueprint => ({
    ...blueprint,
    status: 'todo',
    approved: false,
    lastUpdatedAt: now,
    artifacts: [],
    fields: blueprint.fields ? { ...blueprint.fields } : undefined,
  }));
}

function createMarketingSetup(homeBusinessId: string): MarketingSetup {
  const timestamp = new Date().toISOString();
  return {
    homeBusinessId,
    tasks: createDefaultTasks(),
    activity: [{ at: timestamp, msg: 'Marketing setup initialized by Creo AI.' }],
    requiresApproval: false,
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [businesses, setBusinesses] = useState<BusinessRecord[]>(INITIAL_BUSINESSES);
  const [activeHomeBusinessId, setActiveHomeBusinessIdState] = useState<string>(INITIAL_BUSINESSES[0]?.id ?? '');
  const [memories, setMemories] = useState<Record<string, ContactMemory>>(MEMORIES);
  const [contactTimelines, setContactTimelines] = useState<Record<string, TimelineEvent[]>>(CONTACT_TIMELINES);
  const [prospects, setProspects] = useState<ProspectBusiness[]>(PROSPECT_BUSINESSES);
  const [people, setPeople] = useState<Person[]>(PEOPLE);
  const companySignals = useMemo(() => COMPANY_SIGNALS, []);
  const [marketingSetups, setMarketingSetups] = useState<MarketingSetup[]>([]);
  const [marketingSetupDismissed, setMarketingSetupDismissed] = useState<Record<string, boolean>>({});

  const setActiveHomeBusinessId = (id: string) => {
    setActiveHomeBusinessIdState(id);
  };

  const saveProfileTraits = (contactId: string, traits: ContactMemory['traits']) => {
    setMemories(prev => {
      const existing = prev[contactId];
      if (!existing) return prev;
      return {
        ...prev,
        [contactId]: {
          ...existing,
          traits,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  };

  const toggleFactUse = (contactId: string, factId: string, useInPersonalization: boolean) => {
    setMemories(prev => {
      const existing = prev[contactId];
      if (!existing) return prev;
      return {
        ...prev,
        [contactId]: {
          ...existing,
          facts: existing.facts.map(fact =>
            fact.id === factId ? { ...fact, useInPersonalization } : fact
          ),
        },
      };
    });
  };

  const editFact = (contactId: string, factId: string, patch: Partial<Omit<MemoryFact, 'id'>>) => {
    setMemories(prev => {
      const existing = prev[contactId];
      if (!existing) return prev;
      return {
        ...prev,
        [contactId]: {
          ...existing,
          facts: existing.facts.map(fact =>
            fact.id === factId
              ? {
                  ...fact,
                  ...patch,
                }
              : fact
          ),
        },
      };
    });
  };

  const deleteFact = (contactId: string, factId: string) => {
    setMemories(prev => {
      const existing = prev[contactId];
      if (!existing) return prev;
      return {
        ...prev,
        [contactId]: {
          ...existing,
          facts: existing.facts.filter(fact => fact.id !== factId),
        },
      };
    });
  };

  const promoteEventToFact = (contactId: string, payload: PromotePayload) => {
    setMemories(prev => {
      const existing = prev[contactId];
      if (!existing) return prev;
      const label = payload.label || payload.event.title;
      const lastSeenAt = payload.event.occurredAt;
      const shouldUse = freshness(lastSeenAt) !== 'Cold' && payload.confidence >= 0.6;
      const newFact: MemoryFact = {
        id: `fact-${contactId}-${Date.now()}`,
        key: `event:${payload.event.id}`,
        label,
        status: payload.status,
        confidence: payload.confidence,
        source: payload.event.kind === 'press' ? 'news' : payload.event.kind === 'social' ? 'social' : 'email',
        lastSeenAt,
        snippet: payload.event.snippet,
        useInPersonalization: shouldUse,
      };
      return {
        ...prev,
        [contactId]: {
          ...existing,
          facts: [newFact, ...existing.facts],
          updatedAt: new Date().toISOString(),
        },
      };
    });
    setContactTimelines(prev => {
      const events = prev[contactId];
      if (!events) return prev;
      return {
        ...prev,
        [contactId]: events.map(event =>
          event.id === payload.event.id ? { ...event, promoteable: false } : event
        ),
      };
    });
  };

  const regenerateSummary = (contactId: string) => {
    const phrases = [
      'Emphasize quick wins with AI support and follow up inside a week.',
      'Lead with tailored proof points and offer proactive pricing guidance.',
      'Spotlight community momentum and align next steps to partner goals.',
    ];
    setMemories(prev => {
      const existing = prev[contactId];
      if (!existing) return prev;
      const nextSummary = phrases[Math.floor(Math.random() * phrases.length)];
      return {
        ...prev,
        [contactId]: {
          ...existing,
          summary: nextSummary,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  };

  const appendPricingFact = (contact: ContactRecord) => {
    setMemories(prev => {
      const existing = prev[contact.id];
      if (!existing) return prev;
      const fact: MemoryFact = {
        id: `fact-${contact.id}-pricing-${Date.now()}`,
        key: 'insight:pricing-transparency',
        label: 'Interested in transparent pricing guidance from Creo AI',
        status: 'positive',
        confidence: 0.78,
        source: 'manual',
        lastSeenAt: new Date().toISOString(),
        snippet: 'Auto-pricing simulation captured appetite for transparent tiers.',
        useInPersonalization: true,
      };
      return {
        ...prev,
        [contact.id]: {
          ...existing,
          facts: [fact, ...existing.facts],
          updatedAt: new Date().toISOString(),
        },
      };
    });
  };

  const findMarketingSetup = (homeBusinessId: string) =>
    marketingSetups.find(setup => setup.homeBusinessId === homeBusinessId);

  const startMarketingSetup = (homeBusinessId: string) => {
    setMarketingSetups(prev => {
      if (prev.some(setup => setup.homeBusinessId === homeBusinessId)) {
        return prev;
      }
      const setup = createMarketingSetup(homeBusinessId);
      return [setup, ...prev];
    });
    setMarketingSetupDismissed(prev => ({ ...prev, [homeBusinessId]: false }));
  };

  const updateSetupTask = (homeBusinessId: string, taskId: string, patch: Partial<SetupTask>) => {
    const timestamp = new Date().toISOString();
    setMarketingSetups(prev =>
      prev.map(setup => {
        if (setup.homeBusinessId !== homeBusinessId) return setup;
        return {
          ...setup,
          tasks: setup.tasks.map(task => {
            if (task.id !== taskId) return task;
            return {
              ...task,
              ...patch,
              fields: patch.fields ? { ...task.fields, ...patch.fields } : task.fields,
              lastUpdatedAt: timestamp,
            };
          }),
        };
      }),
    );
  };

  const addSetupArtifact = (homeBusinessId: string, taskId: string, artifact: SetupArtifact) => {
    const timestamp = new Date().toISOString();
    setMarketingSetups(prev =>
      prev.map(setup =>
        setup.homeBusinessId === homeBusinessId
          ? {
              ...setup,
              tasks: setup.tasks.map(task =>
                task.id === taskId
                  ? {
                      ...task,
                      artifacts: [artifact, ...(task.artifacts ?? [])],
                      lastUpdatedAt: timestamp,
                    }
                  : task,
              ),
            }
          : setup,
      ),
    );
  };

  const logSetup = (homeBusinessId: string, message: string) => {
    const entry = { at: new Date().toISOString(), msg: message };
    setMarketingSetups(prev =>
      prev.map(setup =>
        setup.homeBusinessId === homeBusinessId
          ? {
              ...setup,
              activity: [entry, ...setup.activity].slice(0, 30),
            }
          : setup,
      ),
    );
  };

  const computeMarketingHealth = (homeBusinessId: string) => {
    const setup = findMarketingSetup(homeBusinessId);
    if (!setup || !setup.tasks.length) {
      return { score: 0, band: 'red' as const };
    }
    const totalWeight = setup.tasks.reduce((sum, task) => sum + SETUP_IMPACT_WEIGHTS[task.impact], 0);
    if (!totalWeight) {
      return { score: 0, band: 'red' as const };
    }
    const statusScore = (task: SetupTask) => {
      switch (task.status) {
        case 'done':
          return SETUP_IMPACT_WEIGHTS[task.impact];
        case 'in-progress':
          return SETUP_IMPACT_WEIGHTS[task.impact] / 2;
        default:
          return 0;
      }
    };
    const achieved = setup.tasks.reduce((sum, task) => sum + statusScore(task), 0);
    const score = Math.round((achieved / totalWeight) * 100);
    const band: 'red' | 'amber' | 'green' = score < 50 ? 'red' : score < 80 ? 'amber' : 'green';
    return { score, band };
  };

  const setMarketingRequiresApproval = (homeBusinessId: string, requiresApproval: boolean) => {
    setMarketingSetups(prev =>
      prev.map(setup =>
        setup.homeBusinessId === homeBusinessId
          ? {
              ...setup,
              requiresApproval,
            }
          : setup,
      ),
    );
  };

  const markMarketingSetupComplete = (homeBusinessId: string) => {
    const timestamp = new Date().toISOString();
    setMarketingSetups(prev =>
      prev.map(setup =>
        setup.homeBusinessId === homeBusinessId
          ? {
              ...setup,
              completedAt: timestamp,
            }
          : setup,
      ),
    );
    setBusinesses(prev =>
      prev.map(business =>
        business.id === homeBusinessId
          ? {
              ...business,
              marketingSetupCompleted: true,
            }
          : business,
      ),
    );
    setMarketingSetupDismissed(prev => ({ ...prev, [homeBusinessId]: true }));
  };

  const dismissMarketingSetupReminder = (homeBusinessId: string) => {
    setMarketingSetupDismissed(prev => ({ ...prev, [homeBusinessId]: true }));
  };

  const addProspect = (prospect: ProspectBusiness) => {
    setProspects(prev => [prospect, ...prev]);
  };

  const updateProspect = (id: string, patch: Partial<ProspectBusiness>) => {
    setProspects(prev => prev.map(item => (item.id === id ? { ...item, ...patch } : item)));
  };

  const addPerson = (person: Person) => {
    setPeople(prev => [person, ...prev]);
  };

  const updatePerson = (id: string, patch: Partial<Person>) => {
    setPeople(prev => prev.map(item => (item.id === id ? { ...item, ...patch } : item)));
  };

  const movePersonToProspect = (personId: string, prospectBusinessId: string) => {
    setPeople(prev =>
      prev.map(item =>
        item.id === personId
          ? {
              ...item,
              prospectBusinessId,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );
  };

  const findPeopleByProspect = (prospectId: string) => people.filter(person => person.prospectBusinessId === prospectId);

  const value: CreoStoreValue = {
    businesses,
    setBusinesses,
    activeHomeBusinessId,
    setActiveHomeBusinessId,
    memories,
    setMemories,
    companySignals,
    contactTimelines,
    prospects,
    setProspects,
    people,
    setPeople,
    saveProfileTraits,
    toggleFactUse,
    editFact,
    deleteFact,
    promoteEventToFact,
    regenerateSummary,
    appendPricingFact,
    addProspect,
    updateProspect,
    addPerson,
    updatePerson,
    movePersonToProspect,
    findPeopleByProspect,
    marketingSetups,
    marketingSetupDismissed,
    startMarketingSetup,
    updateSetupTask,
    addSetupArtifact,
    logSetup,
    computeMarketingHealth,
    setMarketingRequiresApproval,
    markMarketingSetupComplete,
    dismissMarketingSetupReminder,
  };

  return <CreoStoreContext.Provider value={value}>{children}</CreoStoreContext.Provider>;
}

export function useCreoStore(): CreoStoreValue {
  const context = useContext(CreoStoreContext);
  if (!context) {
    throw new Error('useCreoStore must be used within a StoreProvider');
  }
  return context;
}
