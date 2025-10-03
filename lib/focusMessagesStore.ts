import { getFocusById } from '@/lib/focusStore';

export type FocusMessageRole = 'user' | 'assistant' | 'system';

export interface FocusMessage {
  id: string;
  focusId: string;
  role: FocusMessageRole;
  author?: string;
  text: string;
  createdAt: string;
}

const STORAGE_KEY = 'focus.messages';
let hydrated = false;
let messages: FocusMessage[] = [];

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function nowISO() {
  return new Date().toISOString();
}

function seedIfEmpty() {
  if (messages.length) return;
  const focus = getFocusById('harbor-counseling');
  if (!focus) return;
  const timestamp = nowISO();
  messages = [
    {
      id: createId('msg'),
      focusId: focus.id,
      role: 'assistant',
      author: 'Leo',
      text: 'Let’s target the review surge first. I’ll queue fresh outreach cadences—flag any guardrails before we launch.\n• Rebuild the follow-up ladder\n• Tag high-signal guests for personal nudges',
      createdAt: timestamp,
    },
    {
      id: createId('msg'),
      focusId: focus.id,
      role: 'assistant',
      author: 'Eden',
      text: 'I’ll watch tone + response SLA. Loop me in if brand voice needs tweaks or escalations appear.',
      createdAt: timestamp,
    },
  ];
}

function hydrate() {
  if (hydrated) return;
  hydrated = true;
  if (typeof window === 'undefined') {
    seedIfEmpty();
    return;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as FocusMessage[];
      if (Array.isArray(parsed)) {
        messages = parsed;
        return;
      }
    }
  } catch (error) {
    console.warn('focusMessagesStore: failed to hydrate', error);
  }
  seedIfEmpty();
  persist();
}

function persist() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.warn('focusMessagesStore: failed to persist', error);
  }
}

export function listMessages(focusId: string): FocusMessage[] {
  hydrate();
  return messages
    .filter(message => message.focusId === focusId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function addMessage(input: Omit<FocusMessage, 'id' | 'createdAt'>): FocusMessage {
  hydrate();
  const message: FocusMessage = {
    ...input,
    id: createId('msg'),
    createdAt: nowISO(),
  };
  messages = [...messages, message];
  persist();
  return message;
}

export function addAssistantResponse(focusId: string, userPrompt: string): FocusMessage {
  const focus = getFocusById(focusId);
  const focusName = focus?.title ?? 'this focus';
  const response = addMessage({
    focusId,
    role: 'assistant',
    author: 'Leo',
    text: `Understood. I’ll coordinate the crew around “${focusName}”. Key actions:\n• Prioritise ${userPrompt.replace(/\n+/g, ' ')}\n• Surface blockers or approvals back to you\n• Sync with Eden for tone + KPI QA before launch`,
  });
  return response;
}
