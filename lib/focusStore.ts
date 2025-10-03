import type { Focus, FocusStatus } from '@/lib/types';

export interface FocusCreateInput {
  businessId: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  kpis?: Focus['kpis'];
  milestones?: Focus['milestones'];
  status?: FocusStatus;
}

export interface FocusUpdateInput {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  kpis?: Focus['kpis'];
  milestones?: Focus['milestones'];
  status?: FocusStatus;
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

const STORAGE_KEY = 'focus.library';
const nowISO = () => new Date().toISOString();

let focuses: Focus[] = [
  {
    id: createId('focus'),
    businessId: 'harbor-counseling',
    title: 'Seasonal Reviews Blitz',
    description: 'Drive new therapy reviews ahead of spring intake while maintaining tone and responding within 2 hours.',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['reviews', 'email', 'sms'],
    kpis: [
      { id: createId('kpi'), label: 'Weekly review volume', target: '150', progress: '94' },
      { id: createId('kpi'), label: 'Average rating delta', target: '+0.5', progress: '+0.2' },
    ],
    milestones: [
      { id: createId('milestone'), title: 'Launch updated review drip', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), completed: false },
      { id: createId('milestone'), title: 'QA tone samples with Eden', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), completed: false },
    ],
    status: 'active',
    createdAt: nowISO(),
    updatedAt: nowISO(),
    ownerAgent: 'Leo',
    qaAgent: 'Eden',
  },
  {
    id: createId('focus'),
    businessId: 'summit-ridge',
    title: 'Wholesale Launch Sprint',
    description: 'Partner enablement for wholesale expansion with curated deck and follow-up cadence.',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['sales', 'paid'],
    kpis: [
      { id: createId('kpi'), label: 'Meetings booked', target: '20', progress: '8' },
      { id: createId('kpi'), label: 'Pipeline value', target: '$750k', progress: '$310k' },
    ],
    milestones: [
      { id: createId('milestone'), title: 'Finalize partner pricing tier', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), completed: false },
    ],
    status: 'draft',
    createdAt: nowISO(),
    updatedAt: nowISO(),
    ownerAgent: 'Leo',
    qaAgent: 'Eden',
  },
];

let hydratedFromStorage = false;

function hydrateFromStorage() {
  if (hydratedFromStorage) return;
  if (typeof window === 'undefined') return;
  hydratedFromStorage = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Focus[];
    if (Array.isArray(parsed)) {
      focuses = parsed
        .map(item => ({
          ...item,
          tags: item.tags ?? [],
          kpis: item.kpis ?? [],
          milestones: item.milestones ?? [],
        }))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
  } catch (error) {
    console.warn('focusStore: failed to hydrate from storage', error);
  }
}

function persist(next: Focus[]) {
  focuses = next;
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.warn('focusStore: failed to persist', error);
  }
}

export function getFocuses(): Focus[] {
  hydrateFromStorage();
  return [...focuses];
}

export function listFocuses(): Focus[] {
  return getFocuses().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getFocusById(id: string): Focus | undefined {
  hydrateFromStorage();
  return focuses.find(item => item.id === id);
}

export function createFocus(input: FocusCreateInput): Focus {
  hydrateFromStorage();
  const now = nowISO();
  const start = input.startDate ?? now;
  const end = input.endDate ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const focus: Focus = {
    id: createId('focus'),
    businessId: input.businessId,
    title: input.title,
    description: input.description ?? '',
    startDate: start,
    endDate: end,
    tags: input.tags ?? [],
    kpis: input.kpis ?? [],
    milestones: input.milestones ?? [],
    status: input.status ?? 'draft',
    createdAt: now,
    updatedAt: now,
    ownerAgent: 'Leo',
    qaAgent: 'Eden',
  };
  persist([focus, ...focuses]);
  return focus;
}

export function updateFocus(id: string, patch: FocusUpdateInput): Focus | undefined {
  hydrateFromStorage();
  let updated: Focus | undefined;
  const next = focuses.map(item => {
    if (item.id !== id) return item;
    updated = {
      ...item,
      ...patch,
      tags: patch.tags ?? item.tags,
      kpis: patch.kpis ?? item.kpis,
      milestones: patch.milestones ?? item.milestones,
      status: patch.status ?? item.status,
      updatedAt: nowISO(),
    };
    return updated;
  });
  if (updated) {
    persist(next);
  }
  return updated;
}

export function archiveFocus(id: string): Focus | undefined {
  return updateFocus(id, { status: 'completed' });
}

export function setFocuses(next: Focus[]) {
  persist(next);
}
