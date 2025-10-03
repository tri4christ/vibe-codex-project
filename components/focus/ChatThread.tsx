"use client";

import { useState } from 'react';
import type { Focus } from '@/lib/types';
import type { FocusMessage } from '@/lib/focusMessagesStore';
import { cn } from '@/lib/utils';

interface ChatThreadProps {
  focus?: Focus;
  messages: FocusMessage[];
}

const bubbleStyles: Record<string, string> = {
  user: 'bg-white border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200',
  'assistant:leo': 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-200',
  'assistant:eden': 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-200',
  assistant: 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-200',
  system: 'bg-slate-200 border-slate-300 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200',
};

function resolveStyle(message: FocusMessage) {
  if (message.role === 'user') return bubbleStyles.user;
  if (message.role === 'assistant') {
    if (message.author?.toLowerCase() === 'leo') return bubbleStyles['assistant:leo'];
    if (message.author?.toLowerCase() === 'eden') return bubbleStyles['assistant:eden'];
    return bubbleStyles.assistant;
  }
  return bubbleStyles.system;
}

function resolveInitial(message: FocusMessage) {
  if (message.role === 'user') return 'U';
  if (message.author) return message.author.charAt(0).toUpperCase();
  if (message.role === 'assistant') return 'A';
  return 'S';
}

const MAX_PREVIEW_LENGTH = 200;

export function ChatThread({ focus, messages }: ChatThreadProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  if (!messages.length) {
    return (
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Ask Leo and Eden for orchestration & QA feedback once you describe the focus. Responses appear here.
      </p>
    );
  }

  return (
    <div className="max-h-[480px] space-y-2 overflow-y-auto pr-1">
      {messages.map(message => {
        const isExpanded = expandedIds.has(message.id);
        const showToggle = message.text.length > MAX_PREVIEW_LENGTH;
        const preview = isExpanded
          ? message.text
          : `${message.text.slice(0, MAX_PREVIEW_LENGTH)}${showToggle ? '…' : ''}`;
        return (
          <div
            key={message.id}
            className={cn(
              'flex gap-2 rounded-2xl border px-3 py-2 text-sm shadow-sm transition',
              resolveStyle(message),
            )}
          >
            <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white bg-white text-xs font-semibold text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-700 dark:text-slate-200">
              {resolveInitial(message)}
            </span>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                <span className="font-semibold text-slate-500 dark:text-slate-300">
                  {message.author ?? (message.role === 'user' ? 'You' : 'Assistant')}
                  {message.author && message.author !== 'User' && focus ? (
                    <span className="ml-1 text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Crew</span>
                  ) : null}
                </span>
                <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-600 dark:text-slate-200">{preview}</p>
              {showToggle ? (
                <button
                  type="button"
                  onClick={() =>
                    setExpandedIds(prev => {
                      const next = new Set(prev);
                      if (next.has(message.id)) {
                        next.delete(message.id);
                      } else {
                        next.add(message.id);
                      }
                      return next;
                    })
                  }
                  className="text-xs font-medium text-slate-500 transition hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
                >
                  {isExpanded ? 'Show less' : 'Show more'}
                </button>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
